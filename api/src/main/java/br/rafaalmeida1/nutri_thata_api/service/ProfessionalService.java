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
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfessionalService {

    private final ProfessionalProfileRepository professionalProfileRepository;
    private final InviteRepository inviteRepository;
    private final ProfessionalMapper professionalMapper;
    private final FileCleanupService fileCleanupService;
    private final CacheService cacheService;

    @Cacheable(value = "professional_profiles", key = "#user.id")
    public ProfessionalProfileResponse getProfessionalProfile(User user) {
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais podem acessar este recurso");
        }

        ProfessionalProfile profile = professionalProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Perfil profissional nÃ£o encontrado"));

        return professionalMapper.toProfessionalProfileResponse(profile);
    }

    @Caching(evict = {
        @CacheEvict(value = "professional_profiles", key = "#user.id"),
        @CacheEvict(value = "professional_profiles", key = "'banner_' + #user.id"),
        @CacheEvict(value = "professional_profiles", allEntries = true)
    })
    @Transactional
    public ProfessionalProfileResponse updateProfessionalProfile(User user, UpdateProfessionalProfileRequest request) {
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais podem atualizar este recurso");
        }

        ProfessionalProfile profile = professionalProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Perfil profissional nÃ£o encontrado"));

        // Guardar URLs antigas para remoÃ§Ã£o se forem substituÃ­das
        String oldImage = profile.getImage();
        String oldBackgroundImage = profile.getBackgroundImage();

        // Atualizar campos bÃ¡sicos
        profile.setName(request.getName());
        profile.setTitle(request.getTitle());
        profile.setBio(request.getBio());
        profile.setImage(request.getImage());
        profile.setBackgroundImage(request.getBackgroundImage());
        if (request.getBackgroundPositionX() != null) {
            int x = Math.max(0, Math.min(100, request.getBackgroundPositionX()));
            profile.setBackgroundPositionX(x);
        }
        if (request.getBackgroundPositionY() != null) {
            int y = Math.max(0, Math.min(100, request.getBackgroundPositionY()));
            profile.setBackgroundPositionY(y);
        }

        // Atualizar cores personalizadas do tema
        if (request.getThemePrimaryColor() != null && isValidHexColor(request.getThemePrimaryColor())) {
            profile.setThemePrimaryColor(request.getThemePrimaryColor());
        }
        if (request.getThemeSecondaryColor() != null && isValidHexColor(request.getThemeSecondaryColor())) {
            profile.setThemeSecondaryColor(request.getThemeSecondaryColor());
        }
        // ThemeAccentColor removido - usando ThemePrimaryColor como substituto
        if (request.getThemeBackgroundColor() != null && isValidHexColor(request.getThemeBackgroundColor())) {
            profile.setThemeBackgroundColor(request.getThemeBackgroundColor());
        }
        if (request.getThemeSurfaceColor() != null && isValidHexColor(request.getThemeSurfaceColor())) {
            profile.setThemeSurfaceColor(request.getThemeSurfaceColor());
        }
        // ThemeTextColor removido - usando ThemeTextPrimaryColor como substituto
        if (request.getThemeTextSecondaryColor() != null && isValidHexColor(request.getThemeTextSecondaryColor())) {
            profile.setThemeTextSecondaryColor(request.getThemeTextSecondaryColor());
        }

        profile.setSpecialties(request.getSpecialties());

        profile = professionalProfileRepository.save(profile);

        // Remover arquivos substituÃ­dos (se diferentes e locais)
        if (oldImage != null && request.getImage() != null && !request.getImage().equals(oldImage)) {
            fileCleanupService.deleteByPublicUrl(oldImage);
        }
        if (oldBackgroundImage != null && request.getBackgroundImage() != null && !request.getBackgroundImage().equals(oldBackgroundImage)) {
            fileCleanupService.deleteByPublicUrl(oldBackgroundImage);
        }

        log.info("Perfil profissional atualizado para usuÃ¡rio: {}", user.getEmail());
        
        // Recarregar com especialidades
        profile = professionalProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Perfil profissional nÃ£o encontrado"));

        return professionalMapper.toProfessionalProfileResponse(profile);
    }

    @Cacheable(value = "professional_profiles", key = "#userId")
    public ProfessionalProfileResponse getProfessionalProfileById(Long userId) {
        ProfessionalProfile profile = professionalProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Perfil profissional nÃ£o encontrado"));

        return professionalMapper.toProfessionalProfileResponse(profile);
    }

    @Cacheable(value = "professional_profiles", key = "'banner_' + #user.id")
    public ProfessionalProfileResponse getBannerData(User user) {
        log.info("Buscando dados do banner para usuÃ¡rio: {} (role: {})", user.getEmail(), user.getRole());
        
        // Se for profissional, retorna o prÃ³prio perfil
        if (user.getRole().equals(Role.PROFESSIONAL)) {
            log.info("UsuÃ¡rio Ã© profissional, retornando prÃ³prio perfil");
            ProfessionalProfile profile = professionalProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new NotFoundException("Perfil profissional nÃ£o encontrado"));
            return professionalMapper.toProfessionalProfileResponse(profile);
        }
        
        // Se for paciente, busca o profissional que convidou
        log.info("UsuÃ¡rio Ã© paciente, buscando convite aceito para email: {}", user.getEmail());
        Optional<Invite> acceptedInvite = inviteRepository.findByEmailAndStatus(user.getEmail(), InviteStatus.ACCEPTED);
        
        if (acceptedInvite.isPresent()) {
            log.info("Convite aceito encontrado, buscando perfil do profissional: {}", acceptedInvite.get().getCreatedBy().getEmail());
            // Buscar o perfil do profissional que criou o convite
            User professionalUser = acceptedInvite.get().getCreatedBy();
            ProfessionalProfile profile = professionalProfileRepository.findByUserId(professionalUser.getId())
                    .orElseThrow(() -> new NotFoundException("Perfil do profissional que convidou nÃ£o encontrado"));
            return professionalMapper.toProfessionalProfileResponse(profile);
        }
        
        log.warn("Nenhum convite aceito encontrado para email: {}, usando fallback", user.getEmail());
        // Fallback: se nÃ£o encontrar convite aceito, retorna o primeiro profissional disponÃ­vel
        List<ProfessionalProfile> profiles = professionalProfileRepository.findAll();
        if (profiles.isEmpty()) {
            throw new NotFoundException("Nenhum perfil profissional encontrado");
        }
        
        log.info("Usando perfil de fallback: {}", profiles.get(0).getName());
        return professionalMapper.toProfessionalProfileResponse(profiles.get(0));
    }

    /**
     * Valida se uma string Ã© uma cor hexadecimal vÃ¡lida
     */
    private boolean isValidHexColor(String color) {
        if (color == null || color.trim().isEmpty()) {
            return false;
        }
        return color.matches("^#[0-9A-Fa-f]{6}$");
    }

    private boolean isValidRgbaColor(String color) {
        if (color == null || color.trim().isEmpty()) {
            return false;
        }
        // Validar formato rgba(r, g, b, a) ou rgb(r, g, b)
        String rgbaPattern = "^rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*(?:,\\s*(0|1|0?\\.\\d+))?\\s*\\)$";
        return color.matches(rgbaPattern);
    }

    @Cacheable(value = "theme_data", key = "'global'")
    public ProfessionalProfileResponse getThemeData() {
        List<ProfessionalProfile> profiles = professionalProfileRepository.findAll();
        if (profiles.isEmpty()) {
            throw new NotFoundException("Nenhum perfil profissional encontrado");
        }
        
        return professionalMapper.toProfessionalProfileResponse(profiles.get(0));
    }

    @Caching(evict = {
        @CacheEvict(value = "theme_data", key = "'global'"),
        @CacheEvict(value = "theme", key = "'global'")
    })
    @Transactional
    public void updateTheme(User user, Map<String, String> themeData) {
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais podem atualizar o tema");
        }

        ProfessionalProfile profile = professionalProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Perfil profissional nÃ£o encontrado"));

        // Atualizar cores do tema
        if (themeData.containsKey("primaryColor") && isValidHexColor(themeData.get("primaryColor"))) {
            profile.setThemePrimaryColor(themeData.get("primaryColor"));
        }
        if (themeData.containsKey("secondaryColor") && isValidHexColor(themeData.get("secondaryColor"))) {
            profile.setThemeSecondaryColor(themeData.get("secondaryColor"));
        }
        // accentColor removido - usando primaryColor como substituto
        if (themeData.containsKey("backgroundColor") && isValidHexColor(themeData.get("backgroundColor"))) {
            profile.setThemeBackgroundColor(themeData.get("backgroundColor"));
        }
        if (themeData.containsKey("surfaceColor") && isValidHexColor(themeData.get("surfaceColor"))) {
            profile.setThemeSurfaceColor(themeData.get("surfaceColor"));
        }
        if (themeData.containsKey("textColor") && isValidHexColor(themeData.get("textColor"))) {
            profile.setThemeTextPrimaryColor(themeData.get("textColor"));
        }
        if (themeData.containsKey("textSecondaryColor") && isValidHexColor(themeData.get("textSecondaryColor"))) {
            profile.setThemeTextSecondaryColor(themeData.get("textSecondaryColor"));
        }
        if (themeData.containsKey("borderColor") && isValidHexColor(themeData.get("borderColor"))) {
            profile.setThemeBorderColor(themeData.get("borderColor"));
        }
        if (themeData.containsKey("hoverColor") && isValidHexColor(themeData.get("hoverColor"))) {
            profile.setThemeHoverColor(themeData.get("hoverColor"));
        }
        if (themeData.containsKey("disabledColor") && isValidHexColor(themeData.get("disabledColor"))) {
            profile.setThemeDisabledColor(themeData.get("disabledColor"));
        }
        
        // Cores especï¿½ficas para inputs
        if (themeData.containsKey("inputBackgroundColor") && isValidHexColor(themeData.get("inputBackgroundColor"))) {
            profile.setInputBackgroundColor(themeData.get("inputBackgroundColor"));
        }
        if (themeData.containsKey("inputBorderColor") && isValidHexColor(themeData.get("inputBorderColor"))) {
            profile.setInputBorderColor(themeData.get("inputBorderColor"));
        }
        if (themeData.containsKey("inputFocusColor") && isValidHexColor(themeData.get("inputFocusColor"))) {
            profile.setInputFocusColor(themeData.get("inputFocusColor"));
        }
        if (themeData.containsKey("inputPlaceholderColor") && isValidHexColor(themeData.get("inputPlaceholderColor"))) {
            profile.setInputPlaceholderColor(themeData.get("inputPlaceholderColor"));
        }
        
        // Cores especï¿½ficas para botï¿½es
        if (themeData.containsKey("buttonPrimaryColor") && isValidHexColor(themeData.get("buttonPrimaryColor"))) {
            profile.setButtonPrimaryColor(themeData.get("buttonPrimaryColor"));
        }
        if (themeData.containsKey("buttonPrimaryHoverColor") && isValidHexColor(themeData.get("buttonPrimaryHoverColor"))) {
            profile.setButtonPrimaryHoverColor(themeData.get("buttonPrimaryHoverColor"));
        }
        if (themeData.containsKey("buttonPrimaryTextColor") && isValidHexColor(themeData.get("buttonPrimaryTextColor"))) {
            profile.setButtonPrimaryTextColor(themeData.get("buttonPrimaryTextColor"));
        }
        if (themeData.containsKey("buttonSecondaryColor") && isValidHexColor(themeData.get("buttonSecondaryColor"))) {
            profile.setButtonSecondaryColor(themeData.get("buttonSecondaryColor"));
        }
        if (themeData.containsKey("buttonSecondaryHoverColor") && isValidHexColor(themeData.get("buttonSecondaryHoverColor"))) {
            profile.setButtonSecondaryHoverColor(themeData.get("buttonSecondaryHoverColor"));
        }
        if (themeData.containsKey("buttonSecondaryTextColor") && isValidHexColor(themeData.get("buttonSecondaryTextColor"))) {
            profile.setButtonSecondaryTextColor(themeData.get("buttonSecondaryTextColor"));
        }
        if (themeData.containsKey("buttonDisabledColor") && isValidHexColor(themeData.get("buttonDisabledColor"))) {
            profile.setButtonDisabledColor(themeData.get("buttonDisabledColor"));
        }
        if (themeData.containsKey("buttonDisabledTextColor") && isValidHexColor(themeData.get("buttonDisabledTextColor"))) {
            profile.setButtonDisabledTextColor(themeData.get("buttonDisabledTextColor"));
        }
        
        // Cores de estado
        if (themeData.containsKey("colorSuccess") && isValidHexColor(themeData.get("colorSuccess"))) {
            profile.setColorSuccess(themeData.get("colorSuccess"));
        }
        if (themeData.containsKey("colorWarning") && isValidHexColor(themeData.get("colorWarning"))) {
            profile.setColorWarning(themeData.get("colorWarning"));
        }
        if (themeData.containsKey("colorError") && isValidHexColor(themeData.get("colorError"))) {
            profile.setColorError(themeData.get("colorError"));
        }
        if (themeData.containsKey("colorInfo") && isValidHexColor(themeData.get("colorInfo"))) {
            profile.setColorInfo(themeData.get("colorInfo"));
        }
        
        // Cores de sombra e overlay (validaï¿½ï¿½o diferente para rgba)
        if (themeData.containsKey("colorShadow") && isValidRgbaColor(themeData.get("colorShadow"))) {
            profile.setColorShadow(themeData.get("colorShadow"));
        }
        if (themeData.containsKey("colorOverlay") && isValidRgbaColor(themeData.get("colorOverlay"))) {
            profile.setColorOverlay(themeData.get("colorOverlay"));
        }

        professionalProfileRepository.save(profile);
        log.info("Tema atualizado para usuÃ¡rio: {}", user.getEmail());
    }
}

