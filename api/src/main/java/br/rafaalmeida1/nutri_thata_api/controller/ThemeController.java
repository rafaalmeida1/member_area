package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.ProfessionalProfileResponse;
import br.rafaalmeida1.nutri_thata_api.service.ProfessionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/theme")
@RequiredArgsConstructor
public class ThemeController {

    private final ProfessionalService professionalService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getTheme() {
        Map<String, String> theme = getCachedTheme();
        return ResponseEntity.ok(ApiResponse.success("Tema carregado com sucesso", theme));
    }

    @Cacheable(value = "theme", key = "'global'")
    public Map<String, String> getCachedTheme() {
        try {
            ProfessionalProfileResponse profile = professionalService.getThemeData();
            
            Map<String, String> theme = new HashMap<>();
            theme.put("primaryColor", profile.getThemePrimaryColor() != null ? profile.getThemePrimaryColor() : "#DBCFCB");
            theme.put("secondaryColor", profile.getThemeSecondaryColor() != null ? profile.getThemeSecondaryColor() : "#D8C4A4");
            theme.put("accentColor", profile.getThemeAccentColor() != null ? profile.getThemeAccentColor() : "#A67B5B");
            theme.put("backgroundColor", profile.getThemeBackgroundColor() != null ? profile.getThemeBackgroundColor() : "#FFFFFF");
            theme.put("surfaceColor", profile.getThemeSurfaceColor() != null ? profile.getThemeSurfaceColor() : "#FAFAFA");
            theme.put("textColor", profile.getThemeTextColor() != null ? profile.getThemeTextColor() : "#2C2C2C");
            theme.put("textSecondaryColor", profile.getThemeTextSecondaryColor() != null ? profile.getThemeTextSecondaryColor() : "#666666");

            return theme;
        } catch (Exception e) {
            // Se não conseguir carregar o perfil, retorna tema padrão
            Map<String, String> defaultTheme = new HashMap<>();
            defaultTheme.put("primaryColor", "#DBCFCB");
            defaultTheme.put("secondaryColor", "#D8C4A4");
            defaultTheme.put("accentColor", "#A67B5B");
            defaultTheme.put("backgroundColor", "#FFFFFF");
            defaultTheme.put("surfaceColor", "#FAFAFA");
            defaultTheme.put("textColor", "#2C2C2C");
            defaultTheme.put("textSecondaryColor", "#666666");

            return defaultTheme;
        }
    }
} 