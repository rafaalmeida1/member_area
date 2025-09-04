package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.response.link.PublicLinksResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.AnalyticsService;
import br.rafaalmeida1.nutri_thata_api.service.ProfessionalLinkService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicLinksController {

    private final ProfessionalLinkService linkService;
    private final AnalyticsService analyticsService;

    @GetMapping("/links/{professionalId}")
    public ResponseEntity<PublicLinksResponse> getPublicLinks(
            @PathVariable Long professionalId,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        
        // Trackear visualização da página
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");
        
        analyticsService.trackPageView(professionalId, ipAddress, userAgent, referer, user, null);
        
        PublicLinksResponse response = linkService.getPublicLinks(professionalId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/links/{linkId}/click")
    public ResponseEntity<Void> trackLinkClick(
            @PathVariable Long linkId,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        
        // Trackear clique no link
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");
        
        analyticsService.trackLinkClick(linkId, ipAddress, userAgent, referer, user);
        
        return ResponseEntity.ok().build();
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            // X-Forwarded-For can contain a chain of IP addresses
            return xForwardedForHeader.split(",")[0];
        }
    }
}
