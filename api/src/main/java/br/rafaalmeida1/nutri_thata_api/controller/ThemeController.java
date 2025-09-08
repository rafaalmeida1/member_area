package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.theme.ThemeColorsRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.theme.PredefinedThemeResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.theme.ThemeColorsResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.ThemeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/theme")
@RequiredArgsConstructor
@Slf4j
public class ThemeController {

    private final ThemeService themeService;

    @GetMapping("/colors")
    public ResponseEntity<ApiResponse<ThemeColorsResponse>> getUserThemeColors(
            @AuthenticationPrincipal User user) {
        try {
            ThemeColorsResponse colors = themeService.getUserThemeColors(user);
            return ResponseEntity.ok(ApiResponse.success("Cores do tema carregadas com sucesso", colors));
        } catch (Exception e) {
            log.error("Erro ao carregar cores do tema: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao carregar cores do tema: " + e.getMessage()));
        }
    }

    @PutMapping("/colors")
    public ResponseEntity<ApiResponse<ThemeColorsResponse>> updateUserThemeColors(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ThemeColorsRequest request) {
        try {
            ThemeColorsResponse colors = themeService.updateUserThemeColors(user, request);
            return ResponseEntity.ok(ApiResponse.success("Cores do tema atualizadas com sucesso", colors));
        } catch (Exception e) {
            log.error("Erro ao atualizar cores do tema: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao atualizar cores do tema: " + e.getMessage()));
        }
    }

    @GetMapping("/predefined")
    public ResponseEntity<ApiResponse<List<PredefinedThemeResponse>>> getPredefinedThemes() {
        try {
            List<PredefinedThemeResponse> themes = themeService.getPredefinedThemes();
            return ResponseEntity.ok(ApiResponse.success("Temas pré-definidos carregados com sucesso", themes));
        } catch (Exception e) {
            log.error("Erro ao carregar temas pré-definidos: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao carregar temas pré-definidos: " + e.getMessage()));
        }
    }

    @PostMapping("/apply/{themeId}")
    public ResponseEntity<ApiResponse<ThemeColorsResponse>> applyPredefinedTheme(
            @AuthenticationPrincipal User user,
            @PathVariable String themeId) {
        try {
            ThemeColorsResponse colors = themeService.applyPredefinedTheme(user, themeId);
            return ResponseEntity.ok(ApiResponse.success("Tema aplicado com sucesso", colors));
        } catch (Exception e) {
            log.error("Erro ao aplicar tema: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao aplicar tema: " + e.getMessage()));
        }
    }
}