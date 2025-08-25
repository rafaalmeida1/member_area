package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.UpdateProfessionalProfileRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ProfessionalProfileResponse;
import br.rafaalmeida1.nutri_thata_api.entities.Invite;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.InviteStatus;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.exception.NotFoundException;
import br.rafaalmeida1.nutri_thata_api.mapper.ProfessionalMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.InviteRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.ProfessionalProfileRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfessionalService {

    private final ProfessionalProfileRepository professionalProfileRepository;
    private final InviteRepository inviteRepository;
    private final ProfessionalMapper professionalMapper;

    public ProfessionalProfileResponse getProfessionalProfile(User user) {
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais podem acessar este recurso");
        }

        ProfessionalProfile profile = professionalProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Perfil profissional não encontrado"));



        return professionalMapper.toProfessionalProfileResponse(profile);
    }

    @Transactional
    public ProfessionalProfileResponse updateProfessionalProfile(User user, UpdateProfessionalProfileRequest request) {
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais podem atualizar este recurso");
        }

        ProfessionalProfile profile = professionalProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Perfil profissional não encontrado"));;

        // Atualizar campos básicos
        profile.setName(request.getName());
        profile.setTitle(request.getTitle());
        profile.setBio(request.getBio());
        profile.setImage(request.getImage());
        profile.setBackgroundImage(request.getBackgroundImage());


        // Atualizar especialidades
        if (request.getSpecialties() != null) {
            profile.getSpecialties().clear();
            List<String> validSpecialties = request.getSpecialties().stream()
                    .filter(specialty -> specialty != null && !specialty.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toList());
            profile.getSpecialties().addAll(validSpecialties);
        }

        profile = professionalProfileRepository.save(profile);

        log.info("Perfil profissional atualizado para usuário: {}", user.getEmail());
        
        // Recarregar com especialidades
        profile = professionalProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Perfil profissional não encontrado"));

        return professionalMapper.toProfessionalProfileResponse(profile);
    }

    public ProfessionalProfileResponse getProfessionalProfileById(Long userId) {
        ProfessionalProfile profile = professionalProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Perfil profissional não encontrado"));

        return professionalMapper.toProfessionalProfileResponse(profile);
    }

    public ProfessionalProfileResponse getBannerData(User user) {
        log.info("Buscando dados do banner para usuário: {} (role: {})", user.getEmail(), user.getRole());
        
        // Se for profissional, retorna o próprio perfil
        if (user.getRole().equals(Role.PROFESSIONAL)) {
            log.info("Usuário é profissional, retornando próprio perfil");
            ProfessionalProfile profile = professionalProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new NotFoundException("Perfil profissional não encontrado"));
            return professionalMapper.toProfessionalProfileResponse(profile);
        }
        
        // Se for paciente, busca o profissional que convidou
        log.info("Usuário é paciente, buscando convite aceito para email: {}", user.getEmail());
        Optional<Invite> acceptedInvite = inviteRepository.findByEmailAndStatus(user.getEmail(), InviteStatus.ACCEPTED);
        
        if (acceptedInvite.isPresent()) {
            log.info("Convite aceito encontrado, buscando perfil do profissional: {}", acceptedInvite.get().getCreatedBy().getEmail());
            // Buscar o perfil do profissional que criou o convite
            User professionalUser = acceptedInvite.get().getCreatedBy();
            ProfessionalProfile profile = professionalProfileRepository.findByUserId(professionalUser.getId())
                    .orElseThrow(() -> new NotFoundException("Perfil do profissional que convidou não encontrado"));
            return professionalMapper.toProfessionalProfileResponse(profile);
        }
        
        log.warn("Nenhum convite aceito encontrado para email: {}, usando fallback", user.getEmail());
        // Fallback: se não encontrar convite aceito, retorna o primeiro profissional disponível
        List<ProfessionalProfile> profiles = professionalProfileRepository.findAll();
        if (profiles.isEmpty()) {
            throw new NotFoundException("Nenhum perfil profissional encontrado");
        }
        
        log.info("Usando perfil de fallback: {}", profiles.get(0).getName());
        return professionalMapper.toProfessionalProfileResponse(profiles.get(0));
    }
}