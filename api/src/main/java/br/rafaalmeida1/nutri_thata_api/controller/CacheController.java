package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cache")
@RequiredArgsConstructor
@Slf4j
public class CacheController {

    private final CacheService cacheService;

    @PostMapping("/clear-all")
    public ResponseEntity<ApiResponse<String>> clearAllCache(@AuthenticationPrincipal User user) {
        try {
            cacheService.clearAllCache();
            return ResponseEntity.ok(ApiResponse.success("Cache limpo com sucesso", "Todo o cache do sistema foi limpo"));
        } catch (Exception e) {
            log.error("Erro ao limpar cache: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao limpar cache: " + e.getMessage()));
        }
    }

    @PostMapping("/clear/users")
    public ResponseEntity<ApiResponse<String>> clearUserCache(@AuthenticationPrincipal User user) {
        try {
            cacheService.clearUserCache();
            return ResponseEntity.ok(ApiResponse.success("Cache de usuários limpo", "Cache de usuários foi limpo com sucesso"));
        } catch (Exception e) {
            log.error("Erro ao limpar cache de usuários: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao limpar cache de usuários: " + e.getMessage()));
        }
    }

    @PostMapping("/clear/modules")
    public ResponseEntity<ApiResponse<String>> clearModuleCache(@AuthenticationPrincipal User user) {
        try {
            cacheService.clearModuleCache();
            return ResponseEntity.ok(ApiResponse.success("Cache de módulos limpo", "Cache de módulos foi limpo com sucesso"));
        } catch (Exception e) {
            log.error("Erro ao limpar cache de módulos: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao limpar cache de módulos: " + e.getMessage()));
        }
    }

    @PostMapping("/clear/sessions")
    public ResponseEntity<ApiResponse<String>> clearSessionCache(@AuthenticationPrincipal User user) {
        try {
            cacheService.clearSessionCache();
            return ResponseEntity.ok(ApiResponse.success("Cache de sessões limpo", "Cache de sessões foi limpo com sucesso"));
        } catch (Exception e) {
            log.error("Erro ao limpar cache de sessões: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao limpar cache de sessões: " + e.getMessage()));
        }
    }

    @PostMapping("/clear/themes")
    public ResponseEntity<ApiResponse<String>> clearThemeCache(@AuthenticationPrincipal User user) {
        try {
            cacheService.clearThemeCache();
            return ResponseEntity.ok(ApiResponse.success("Cache de temas limpo", "Cache de temas foi limpo com sucesso"));
        } catch (Exception e) {
            log.error("Erro ao limpar cache de temas: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao limpar cache de temas: " + e.getMessage()));
        }
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<CacheService.CacheInfo>> getCacheInfo(@AuthenticationPrincipal User user) {
        try {
            CacheService.CacheInfo cacheInfo = cacheService.getCacheInfo();
            return ResponseEntity.ok(ApiResponse.success("Informações do cache obtidas com sucesso", cacheInfo));
        } catch (Exception e) {
            log.error("Erro ao obter informações do cache: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao obter informações do cache: " + e.getMessage()));
        }
    }
}