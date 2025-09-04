package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.linkpage.UpdateLinkPageProfileRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.linkpage.LinkPageProfileResponse;
import br.rafaalmeida1.nutri_thata_api.entities.LinkPageProfile;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import br.rafaalmeida1.nutri_thata_api.mapper.LinkPageProfileMapper;
import br.rafaalmeida1.nutri_thata_api.repository.LinkPageProfileRepository;
import br.rafaalmeida1.nutri_thata_api.repository.ProfessionalProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LinkPageProfileService {

    private final LinkPageProfileRepository linkPageProfileRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final LinkPageProfileMapper linkPageProfileMapper;

    public LinkPageProfileResponse getOrCreateLinkPageProfile(Long userId) {
        log.info("Obtendo ou criando perfil da página de links para usuário: {}", userId);

        ProfessionalProfile professionalProfile = professionalProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Perfil profissional não encontrado"));

        Optional<LinkPageProfile> existing = linkPageProfileRepository.findByProfessionalProfile(professionalProfile);

        if (existing.isPresent()) {
            return linkPageProfileMapper.toResponse(existing.get());
        }

        // Criar um novo perfil de página com configurações padrão
        LinkPageProfile newProfile = LinkPageProfile.builder()
                .professionalProfile(professionalProfile)
                .displayName(professionalProfile.getName())
                .displayTitle(professionalProfile.getSpecialty())
                .displayBio(professionalProfile.getBio())
                .useSiteColors(true) // Por padrão, usar cores do site
                .showProfileImage(true)
                .showTitle(true)
                .showBio(true)
                .showBranding(true)
                .isPublic(true)
                .passwordProtected(false)
                .build();

        // Se useSiteColors for true, copiar as cores do perfil profissional
        if (newProfile.getUseSiteColors()) {
            copyColorsFromProfessionalProfile(newProfile, professionalProfile);
        }

        LinkPageProfile saved = linkPageProfileRepository.save(newProfile);
        log.info("Novo perfil de página criado para usuário: {}", userId);

        return linkPageProfileMapper.toResponse(saved);
    }

    public LinkPageProfileResponse updateLinkPageProfile(Long userId, UpdateLinkPageProfileRequest request) {
        log.info("Atualizando perfil da página de links para usuário: {}", userId);

        ProfessionalProfile professionalProfile = professionalProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Perfil profissional não encontrado"));

        LinkPageProfile linkPageProfile = linkPageProfileRepository.findByProfessionalProfile(professionalProfile)
                .orElseGet(() -> {
                    log.info("Perfil da página não existe, criando um novo");
                    return LinkPageProfile.builder()
                            .professionalProfile(professionalProfile)
                            .useSiteColors(true)
                            .showProfileImage(true)
                            .showTitle(true)
                            .showBio(true)
                            .showBranding(true)
                            .isPublic(true)
                            .passwordProtected(false)
                            .build();
                });

        // Atualizar os campos
        linkPageProfileMapper.updateEntity(request, linkPageProfile);

        // Se mudou para usar cores do site, copiar as cores
        if (Boolean.TRUE.equals(request.getUseSiteColors())) {
            copyColorsFromProfessionalProfile(linkPageProfile, professionalProfile);
        }

        LinkPageProfile saved = linkPageProfileRepository.save(linkPageProfile);
        log.info("Perfil da página atualizado para usuário: {}", userId);

        return linkPageProfileMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public LinkPageProfileResponse getLinkPageProfileByProfessionalId(Long professionalId) {
        log.info("Obtendo perfil da página de links para profissional: {}", professionalId);

        LinkPageProfile linkPageProfile = linkPageProfileRepository.findByProfessionalProfileId(professionalId)
                .orElse(null);

        if (linkPageProfile == null) {
            // Se não existe perfil personalizado, criar um temporário com dados do perfil profissional
            ProfessionalProfile professionalProfile = professionalProfileRepository.findById(professionalId)
                    .orElseThrow(() -> new RuntimeException("Perfil profissional não encontrado"));

            LinkPageProfile tempProfile = LinkPageProfile.builder()
                    .professionalProfile(professionalProfile)
                    .displayName(professionalProfile.getName())
                    .displayTitle(professionalProfile.getSpecialty())
                    .displayBio(professionalProfile.getBio())
                    .displayImageUrl(professionalProfile.getImageUrl())
                    .useSiteColors(true)
                    .showProfileImage(true)
                    .showTitle(true)
                    .showBio(true)
                    .showBranding(true)
                    .isPublic(true)
                    .passwordProtected(false)
                    .build();

            copyColorsFromProfessionalProfile(tempProfile, professionalProfile);
            return linkPageProfileMapper.toResponse(tempProfile);
        }

        // Verificar se deve usar cores do site
        if (Boolean.TRUE.equals(linkPageProfile.getUseSiteColors())) {
            copyColorsFromProfessionalProfile(linkPageProfile, linkPageProfile.getProfessionalProfile());
        }

        return linkPageProfileMapper.toResponse(linkPageProfile);
    }

    public void copyColorsFromSite(Long userId) {
        log.info("Copiando cores do site para página de links do usuário: {}", userId);

        ProfessionalProfile professionalProfile = professionalProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Perfil profissional não encontrado"));

        LinkPageProfile linkPageProfile = linkPageProfileRepository.findByProfessionalProfile(professionalProfile)
                .orElseThrow(() -> new RuntimeException("Perfil da página não encontrado"));

        copyColorsFromProfessionalProfile(linkPageProfile, professionalProfile);
        linkPageProfile.setUseSiteColors(true);

        linkPageProfileRepository.save(linkPageProfile);
        log.info("Cores copiadas do site para página de links do usuário: {}", userId);
    }

    private void copyColorsFromProfessionalProfile(LinkPageProfile linkPageProfile, ProfessionalProfile professionalProfile) {
        linkPageProfile.setPagePrimaryColor(professionalProfile.getThemePrimaryColor());
        linkPageProfile.setPageSecondaryColor(professionalProfile.getThemeSecondaryColor());
        linkPageProfile.setPageBackgroundColor(professionalProfile.getThemeBackgroundColor());
        linkPageProfile.setPageSurfaceColor(professionalProfile.getThemeSurfaceColor());
        linkPageProfile.setPageTextPrimaryColor(professionalProfile.getThemeTextPrimaryColor());
        linkPageProfile.setPageTextSecondaryColor(professionalProfile.getThemeTextSecondaryColor());
        linkPageProfile.setPageBorderColor(professionalProfile.getThemeBorderColor());
        linkPageProfile.setPageHoverColor(professionalProfile.getThemeHoverColor());
    }
}
