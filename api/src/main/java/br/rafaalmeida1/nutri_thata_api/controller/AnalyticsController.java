package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.analytics.LinkAnalyticsResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.analytics.PageAnalyticsResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/professional/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageAnalyticsResponse>> getPageAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal User user) {
        
        // Se não especificado, usar últimos 30 dias
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        PageAnalyticsResponse analytics = analyticsService.getPageAnalytics(user, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Estatísticas de página", analytics));
    }

    @GetMapping("/link/{linkId}")
    public ResponseEntity<ApiResponse<LinkAnalyticsResponse>> getLinkAnalytics(
            @PathVariable Long linkId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @AuthenticationPrincipal User user) {
        
        // Se não especificado, usar últimos 30 dias
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        LinkAnalyticsResponse analytics = analyticsService.getLinkAnalytics(linkId, user, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Estatísticas de link", analytics));
    }
}
