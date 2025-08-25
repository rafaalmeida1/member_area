package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.auth.CreateProfessionalRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.auth.LoginRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.auth.PatientRegisterRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.auth.AuthResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.user.UserResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.mapper.UserMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.ProfessionalProfileRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse registerPatient(PatientRegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Este email já está em uso");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .birthDate(request.getBirthDate())
                .role(Role.PATIENT)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        
        String jwtToken = jwtService.generateToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);


        return AuthResponse.builder()
                .token(jwtToken)
                .user(userResponse)
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        if (!user.getIsActive()) {
            throw new BusinessException("Conta desativada");
        }

        String jwtToken = jwtService.generateToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);


        return AuthResponse.builder()
                .token(jwtToken)
                .user(userResponse)
                .build();
    }

    @Transactional
    public AuthResponse createProfessional(CreateProfessionalRequest request) {

        if (userRepository.existsByEmail(request.getUser().getEmail())) {
            throw new BusinessException("Este email já está em uso");
        }

        // Create user
        User user = User.builder()
                .name(request.getUser().getName())
                .email(request.getUser().getEmail())
                .password(passwordEncoder.encode(request.getUser().getPassword()))
                .role(Role.PROFESSIONAL)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Create professional profile
        ProfessionalProfile professionalProfile = ProfessionalProfile.builder()
                .user(user)
                .name(request.getUser().getName())
                .title(request.getProfessional().getTitle())
                .bio(request.getProfessional().getBio())
                .specialties(request.getProfessional().getSpecialties())
                .build();

        professionalProfileRepository.save(professionalProfile);

        String jwtToken = jwtService.generateToken(user);
        UserResponse userResponse = userMapper.toUserResponse(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userResponse)
                .build();
    }

    public String refreshToken(String refreshToken) {
        String userEmail = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        if (jwtService.isTokenValid(refreshToken, user)) {
            return jwtService.generateToken(user);
        } else {
            throw new BusinessException("Token de refresh inválido");
        }
    }
}