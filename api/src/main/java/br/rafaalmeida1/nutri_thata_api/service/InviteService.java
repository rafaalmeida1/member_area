package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.invite.AcceptInviteRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.invite.CreateInviteRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.auth.AuthResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.invite.InvitePreviewResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.invite.InviteResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.user.UserResponse;
import br.rafaalmeida1.nutri_thata_api.entities.Invite;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.InviteStatus;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.exception.NotFoundException;
import br.rafaalmeida1.nutri_thata_api.mapper.InviteMapper;
import br.rafaalmeida1.nutri_thata_api.mapper.UserMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.InviteRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InviteService {

    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final InviteMapper inviteMapper;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${nutri.invite.expiration-days}")
    private int inviteExpirationDays;

    @Value("${nutri.invite.base-url}")
    private String frontendBaseUrl;

    @Transactional
    public InviteResponse createInvite(CreateInviteRequest request, User creator) {

        if (!creator.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais e administradores podem criar convites");
        }

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Já existe um usuário cadastrado com este email");
        }

        // Check if there's already a pending invite for this email
        if (inviteRepository.existsByEmailAndStatus(request.getEmail(), InviteStatus.PENDING)) {
            throw new BusinessException("Já existe um convite pendente para este email");
        }

        // Generate unique token
        String token = generateInviteToken();
        
        Invite invite = Invite.builder()
                .email(request.getEmail())
                .token(token)
                .role(Role.PATIENT)
                .prefill(request.getPrefill())
                .status(InviteStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(inviteExpirationDays))
                .createdBy(creator)
                .build();

        invite = inviteRepository.save(invite);

        // Send invite email asynchronously
        sendInviteEmailAsync(invite, creator);

        return inviteMapper.toInviteResponse(invite);
    }

    public InvitePreviewResponse getInviteByToken(String token) {

        Invite invite = inviteRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Convite não encontrado"));

        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new BusinessException("Este convite já foi utilizado");
        }

        if (invite.isExpired()) {
            // Mark as expired
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
            throw new BusinessException("Este convite expirou");
        }

        return inviteMapper.toInvitePreviewResponse(invite);
    }

    @Transactional
    public AuthResponse acceptInvite(String token, AcceptInviteRequest request) {

        Invite invite = inviteRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Convite não encontrado"));

        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new BusinessException("Este convite já foi utilizado");
        }

        if (invite.isExpired()) {
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
            throw new BusinessException("Este convite expirou");
        }

        // Check if user already exists (safety check)
        if (userRepository.existsByEmail(invite.getEmail())) {
            throw new BusinessException("Já existe um usuário cadastrado com este email");
        }

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(invite.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(invite.getRole())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Mark invite as accepted
        invite.setStatus(InviteStatus.ACCEPTED);
        invite.setAcceptedAt(LocalDateTime.now());
        inviteRepository.save(invite);

        // Send welcome email asynchronously
        sendWelcomeEmailAsync(user);

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);


        return AuthResponse.builder()
                .token(jwtToken)
                .user(userResponse)
                .build();
    }

    public Page<InviteResponse> getInvitesByCreator(User creator, InviteStatus status, Pageable pageable) {

        Page<Invite> invites;
        if (status != null) {
            invites = inviteRepository.findByCreatedByAndStatus(creator, status, pageable);
        } else {
            invites = inviteRepository.findByCreatedBy(creator, pageable);
        }

        return invites.map(inviteMapper::toInviteResponse);
    }

    @Transactional
    public void resendInvite(UUID inviteId, User currentUser) {

        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new NotFoundException("Convite não encontrado"));

        // Check permissions: creator or admin
        if (!currentUser.getRole().equals(Role.PROFESSIONAL) && !invite.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BusinessException("Apenas o criador do convite ou administradores podem reenviá-lo");
        }

        if (invite.getStatus() != InviteStatus.PENDING) {
            throw new BusinessException("Apenas convites pendentes podem ser reenviados");
        }

        if (invite.isExpired()) {
            // Extend expiration
            invite.setExpiresAt(LocalDateTime.now().plusDays(inviteExpirationDays));
            invite.setStatus(InviteStatus.PENDING);
            inviteRepository.save(invite);
        }

        // Resend email
        sendInviteEmailAsync(invite, invite.getCreatedBy());
    }

    @Transactional
    public void cancelInvite(UUID inviteId, User currentUser) {

        Invite invite = inviteRepository.findById(inviteId)
                .orElseThrow(() -> new NotFoundException("Convite não encontrado"));

        // Check permissions: creator or admin
        if (!currentUser.getRole().equals(Role.PROFESSIONAL) && !invite.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BusinessException("Apenas o criador do convite ou administradores podem cancelá-lo");
        }

        if (invite.getStatus() == InviteStatus.ACCEPTED) {
            throw new BusinessException("Não é possível cancelar um convite já aceito");
        }

        invite.setStatus(InviteStatus.CANCELLED);
        inviteRepository.save(invite);
    }

    private String generateInviteToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder token = new StringBuilder();
        String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        
        for (int i = 0; i < 32; i++) {
            token.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return token.toString();
    }

    @Async
    private void sendInviteEmailAsync(Invite invite, User inviter) {
        try {
            String prefillName = null;
            if (invite.getPrefill() != null) {
                prefillName = (String) invite.getPrefill().get("name");
            }
            
            String inviteUrl = frontendBaseUrl + "/invite/" + invite.getToken();
            emailService.sendInviteEmail(
                invite.getEmail(),
                invite.getToken(),
                inviter.getName(),
                prefillName
            );
        } catch (Exception e) {
        }
    }

    @Async
    private void sendWelcomeEmailAsync(User user) {
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
        }
    }
}