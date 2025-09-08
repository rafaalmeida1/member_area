package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.dashboard.DashboardStatsResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.dashboard.ProfessionalInfoResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.module.ModuleResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal User user) {
        try {
            DashboardStatsResponse stats = dashboardService.getDashboardStats(user);
            return ResponseEntity.ok(ApiResponse.success("Estatísticas carregadas com sucesso", stats));
        } catch (Exception e) {
            log.error("Erro ao carregar estatísticas do dashboard: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao carregar estatísticas: " + e.getMessage()));
        }
    }

    @GetMapping("/professional-info")
    public ResponseEntity<ApiResponse<ProfessionalInfoResponse>> getProfessionalInfo(
            @AuthenticationPrincipal User user) {
        try {
            ProfessionalInfoResponse info = dashboardService.getProfessionalInfo(user);
            return ResponseEntity.ok(ApiResponse.success("Informações profissionais carregadas com sucesso", info));
        } catch (Exception e) {
            log.error("Erro ao carregar informações profissionais: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao carregar informações profissionais: " + e.getMessage()));
        }
    }

    @GetMapping("/modules")
    public ResponseEntity<ApiResponse<List<ModuleResponse>>> getDashboardModules(
            @AuthenticationPrincipal User user) {
        try {
            List<ModuleResponse> modules = dashboardService.getModulesForDashboard(user);
            return ResponseEntity.ok(ApiResponse.success("Módulos carregados com sucesso", modules));
        } catch (Exception e) {
            log.error("Erro ao carregar módulos do dashboard: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao carregar módulos: " + e.getMessage()));
        }
    }
}
