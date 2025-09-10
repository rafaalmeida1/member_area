package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.theme.ThemeColorsRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.theme.PredefinedThemeResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.theme.ThemeColorsResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.mapper.ThemeMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThemeService {

    private final UserRepository userRepository;
    private final ThemeMapper themeMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Busca as cores do tema do usuário
     */
    public ThemeColorsResponse getUserThemeColors(User user) {
        return themeMapper.toThemeColorsResponse(user);
    }

    /**
     * Atualiza as cores do tema do usuário
     */
    @Transactional
    public ThemeColorsResponse updateUserThemeColors(User user, ThemeColorsRequest request) {
        log.info("Atualizando cores do tema para usuário: {}", user.getEmail());
        
        // Atualizar cores no usuário
        user.setThemePrimaryColor(request.getThemePrimaryColor());
        user.setThemeSecondaryColor(request.getThemeSecondaryColor());
        user.setThemeAccentColor(request.getThemeAccentColor());
        user.setThemeBackgroundColor(request.getThemeBackgroundColor());
        user.setThemeSurfaceColor(request.getThemeSurfaceColor());
        user.setThemeTextColor(request.getThemeTextColor());
        user.setThemeTextSecondaryColor(request.getThemeTextSecondaryColor());
        user.setThemeBorderColor(request.getThemeBorderColor());
        user.setThemeInputBgColor(request.getThemeInputBgColor());
        user.setThemeInputBorderColor(request.getThemeInputBorderColor());
        user.setThemeInputFocusColor(request.getThemeInputFocusColor());
        user.setThemeButtonPrimaryBg(request.getThemeButtonPrimaryBg());
        user.setThemeButtonPrimaryHover(request.getThemeButtonPrimaryHover());
        user.setThemeButtonPrimaryText(request.getThemeButtonPrimaryText());
        user.setThemeButtonSecondaryBg(request.getThemeButtonSecondaryBg());
        user.setThemeButtonSecondaryHover(request.getThemeButtonSecondaryHover());
        user.setThemeButtonSecondaryText(request.getThemeButtonSecondaryText());
        user.setThemeButtonDisabledBg(request.getThemeButtonDisabledBg());
        user.setThemeButtonDisabledText(request.getThemeButtonDisabledText());
        user.setThemeSuccessColor(request.getThemeSuccessColor());
        user.setThemeWarningColor(request.getThemeWarningColor());
        user.setThemeErrorColor(request.getThemeErrorColor());
        user.setThemeInfoColor(request.getThemeInfoColor());
        user.setSelectedTheme(request.getSelectedTheme());

        user = userRepository.save(user);
        
        log.info("Cores do tema atualizadas com sucesso para usuário: {}", user.getEmail());
        return themeMapper.toThemeColorsResponse(user);
    }

    /**
     * Aplica um tema pré-definido
     */
    @Transactional
    public ThemeColorsResponse applyPredefinedTheme(User user, String themeId) {
        log.info("Aplicando tema pré-definido {} para usuário: {}", themeId, user.getEmail());
        
        PredefinedThemeResponse theme = getPredefinedThemes().stream()
                .filter(t -> t.getId().equals(themeId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tema não encontrado: " + themeId));

        // Aplicar cores do tema pré-definido
        user.setThemePrimaryColor(theme.getColors().getThemePrimaryColor());
        user.setThemeSecondaryColor(theme.getColors().getThemeSecondaryColor());
        user.setThemeAccentColor(theme.getColors().getThemeAccentColor());
        user.setThemeBackgroundColor(theme.getColors().getThemeBackgroundColor());
        user.setThemeSurfaceColor(theme.getColors().getThemeSurfaceColor());
        user.setThemeTextColor(theme.getColors().getThemeTextColor());
        user.setThemeTextSecondaryColor(theme.getColors().getThemeTextSecondaryColor());
        user.setThemeBorderColor(theme.getColors().getThemeBorderColor());
        user.setThemeInputBgColor(theme.getColors().getThemeInputBgColor());
        user.setThemeInputBorderColor(theme.getColors().getThemeInputBorderColor());
        user.setThemeInputFocusColor(theme.getColors().getThemeInputFocusColor());
        user.setThemeButtonPrimaryBg(theme.getColors().getThemeButtonPrimaryBg());
        user.setThemeButtonPrimaryHover(theme.getColors().getThemeButtonPrimaryHover());
        user.setThemeButtonPrimaryText(theme.getColors().getThemeButtonPrimaryText());
        user.setThemeButtonSecondaryBg(theme.getColors().getThemeButtonSecondaryBg());
        user.setThemeButtonSecondaryHover(theme.getColors().getThemeButtonSecondaryHover());
        user.setThemeButtonSecondaryText(theme.getColors().getThemeButtonSecondaryText());
        user.setThemeButtonDisabledBg(theme.getColors().getThemeButtonDisabledBg());
        user.setThemeButtonDisabledText(theme.getColors().getThemeButtonDisabledText());
        user.setThemeSuccessColor(theme.getColors().getThemeSuccessColor());
        user.setThemeWarningColor(theme.getColors().getThemeWarningColor());
        user.setThemeErrorColor(theme.getColors().getThemeErrorColor());
        user.setThemeInfoColor(theme.getColors().getThemeInfoColor());
        user.setSelectedTheme(themeId);

        user = userRepository.save(user);
        
        log.info("Tema pré-definido {} aplicado com sucesso para usuário: {}", themeId, user.getEmail());
        return themeMapper.toThemeColorsResponse(user);
    }

    /**
     * Busca temas pré-definidos
     */
    public List<PredefinedThemeResponse> getPredefinedThemes() {
        return Arrays.asList(
            // Tema Padrão (Rosa)
            PredefinedThemeResponse.builder()
                .id("default")
                .name("Padrão")
                .description("Tema padrão com tons de rosa e bege")
                .previewColor("#DBCFCB")
                .colors(ThemeColorsResponse.builder()
                    .themePrimaryColor("#DBCFCB")
                    .themeSecondaryColor("#D8C4A4")
                    .themeAccentColor("#D8C4A4")
                    .themeBackgroundColor("#FFFFFF")
                    .themeSurfaceColor("#FAFAFA")
                    .themeTextColor("#2C2C2C")
                    .themeTextSecondaryColor("#666666")
                    .themeBorderColor("#E5E5E5")
                    .themeInputBgColor("#FFFFFF")
                    .themeInputBorderColor("#D1D5DB")
                    .themeInputFocusColor("#D8C4A4")
                    .themeButtonPrimaryBg("#D8C4A4")
                    .themeButtonPrimaryHover("#8B5A3C")
                    .themeButtonPrimaryText("#FFFFFF")
                    .themeButtonSecondaryBg("#F3F4F6")
                    .themeButtonSecondaryHover("#E5E7EB")
                    .themeButtonSecondaryText("#374151")
                    .themeButtonDisabledBg("#F9FAFB")
                    .themeButtonDisabledText("#9CA3AF")
                    .themeSuccessColor("#10B981")
                    .themeWarningColor("#F59E0B")
                    .themeErrorColor("#EF4444")
                    .themeInfoColor("#3B82F6")
                    .selectedTheme("default")
                    .build())
                .build(),

            // Tema Azul
            PredefinedThemeResponse.builder()
                .id("blue")
                .name("Azul")
                .description("Tema moderno com tons de azul")
                .previewColor("#3B82F6")
                .colors(ThemeColorsResponse.builder()
                    .themePrimaryColor("#3B82F6")
                    .themeSecondaryColor("#60A5FA")
                    .themeAccentColor("#1D4ED8")
                    .themeBackgroundColor("#FFFFFF")
                    .themeSurfaceColor("#F8FAFC")
                    .themeTextColor("#1E293B")
                    .themeTextSecondaryColor("#64748B")
                    .themeBorderColor("#E2E8F0")
                    .themeInputBgColor("#FFFFFF")
                    .themeInputBorderColor("#CBD5E1")
                    .themeInputFocusColor("#3B82F6")
                    .themeButtonPrimaryBg("#3B82F6")
                    .themeButtonPrimaryHover("#2563EB")
                    .themeButtonPrimaryText("#FFFFFF")
                    .themeButtonSecondaryBg("#F1F5F9")
                    .themeButtonSecondaryHover("#E2E8F0")
                    .themeButtonSecondaryText("#475569")
                    .themeButtonDisabledBg("#F8FAFC")
                    .themeButtonDisabledText("#94A3B8")
                    .themeSuccessColor("#10B981")
                    .themeWarningColor("#F59E0B")
                    .themeErrorColor("#EF4444")
                    .themeInfoColor("#06B6D4")
                    .selectedTheme("blue")
                    .build())
                .build(),

            // Tema Verde
            PredefinedThemeResponse.builder()
                .id("green")
                .name("Verde")
                .description("Tema natural com tons de verde")
                .previewColor("#10B981")
                .colors(ThemeColorsResponse.builder()
                    .themePrimaryColor("#10B981")
                    .themeSecondaryColor("#34D399")
                    .themeAccentColor("#059669")
                    .themeBackgroundColor("#FFFFFF")
                    .themeSurfaceColor("#F0FDF4")
                    .themeTextColor("#064E3B")
                    .themeTextSecondaryColor("#047857")
                    .themeBorderColor("#D1FAE5")
                    .themeInputBgColor("#FFFFFF")
                    .themeInputBorderColor("#A7F3D0")
                    .themeInputFocusColor("#10B981")
                    .themeButtonPrimaryBg("#10B981")
                    .themeButtonPrimaryHover("#059669")
                    .themeButtonPrimaryText("#FFFFFF")
                    .themeButtonSecondaryBg("#ECFDF5")
                    .themeButtonSecondaryHover("#D1FAE5")
                    .themeButtonSecondaryText("#065F46")
                    .themeButtonDisabledBg("#F0FDF4")
                    .themeButtonDisabledText("#6B7280")
                    .themeSuccessColor("#10B981")
                    .themeWarningColor("#F59E0B")
                    .themeErrorColor("#EF4444")
                    .themeInfoColor("#3B82F6")
                    .selectedTheme("green")
                    .build())
                .build(),

            // Tema Roxo
            PredefinedThemeResponse.builder()
                .id("purple")
                .name("Roxo")
                .description("Tema elegante com tons de roxo")
                .previewColor("#8B5CF6")
                .colors(ThemeColorsResponse.builder()
                    .themePrimaryColor("#8B5CF6")
                    .themeSecondaryColor("#A78BFA")
                    .themeAccentColor("#7C3AED")
                    .themeBackgroundColor("#FFFFFF")
                    .themeSurfaceColor("#FAF5FF")
                    .themeTextColor("#581C87")
                    .themeTextSecondaryColor("#7C2D12")
                    .themeBorderColor("#E9D5FF")
                    .themeInputBgColor("#FFFFFF")
                    .themeInputBorderColor("#C4B5FD")
                    .themeInputFocusColor("#8B5CF6")
                    .themeButtonPrimaryBg("#8B5CF6")
                    .themeButtonPrimaryHover("#7C3AED")
                    .themeButtonPrimaryText("#FFFFFF")
                    .themeButtonSecondaryBg("#F3E8FF")
                    .themeButtonSecondaryHover("#E9D5FF")
                    .themeButtonSecondaryText("#6B21A8")
                    .themeButtonDisabledBg("#FAF5FF")
                    .themeButtonDisabledText("#9CA3AF")
                    .themeSuccessColor("#10B981")
                    .themeWarningColor("#F59E0B")
                    .themeErrorColor("#EF4444")
                    .themeInfoColor("#3B82F6")
                    .selectedTheme("purple")
                    .build())
                .build(),

            // Tema Dark Mode
            PredefinedThemeResponse.builder()
                .id("dark")
                .name("Modo Escuro")
                .description("Tema escuro moderno")
                .previewColor("#1F2937")
                .colors(ThemeColorsResponse.builder()
                    .themePrimaryColor("#3B82F6")
                    .themeSecondaryColor("#60A5FA")
                    .themeAccentColor("#1D4ED8")
                    .themeBackgroundColor("#111827")
                    .themeSurfaceColor("#1F2937")
                    .themeTextColor("#F9FAFB")
                    .themeTextSecondaryColor("#D1D5DB")
                    .themeBorderColor("#374151")
                    .themeInputBgColor("#1F2937")
                    .themeInputBorderColor("#4B5563")
                    .themeInputFocusColor("#3B82F6")
                    .themeButtonPrimaryBg("#3B82F6")
                    .themeButtonPrimaryHover("#2563EB")
                    .themeButtonPrimaryText("#FFFFFF")
                    .themeButtonSecondaryBg("#374151")
                    .themeButtonSecondaryHover("#4B5563")
                    .themeButtonSecondaryText("#F9FAFB")
                    .themeButtonDisabledBg("#1F2937")
                    .themeButtonDisabledText("#6B7280")
                    .themeSuccessColor("#10B981")
                    .themeWarningColor("#F59E0B")
                    .themeErrorColor("#EF4444")
                    .themeInfoColor("#06B6D4")
                    .selectedTheme("dark")
                    .build())
                .build()
        );
    }

    /**
     * Limpa todo o cache do Redis
     */
    public void clearCache() {
        try {
            log.info("Iniciando limpeza do cache Redis");
            
            // Limpar todas as chaves do Redis
            redisTemplate.getConnectionFactory().getConnection().flushAll();
            
            log.info("Cache Redis limpo com sucesso");
        } catch (Exception e) {
            log.error("Erro ao limpar cache Redis: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao limpar cache: " + e.getMessage());
        }
    }
}
