package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.user.TrackActivityRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.user.TrackModuleViewRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.user.TrackModuleCompletionRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.user.EndSessionRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.UserActivityTrackingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-activity")
@RequiredArgsConstructor
@Slf4j
public class UserActivityController {

    private final UserActivityTrackingService userActivityTrackingService;

    @PostMapping("/track/page-view")
    public ResponseEntity<ApiResponse<Void>> trackPageView(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TrackActivityRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            String userAgent = httpRequest.getHeader("User-Agent");
            String ipAddress = getClientIpAddress(httpRequest);
            
            userActivityTrackingService.trackPageView(
                user, 
                request.getPagePath(), 
                request.getSessionId(), 
                userAgent, 
                ipAddress
            );
            
            return ResponseEntity.ok(ApiResponse.success("Página visualizada rastreada com sucesso", null));
        } catch (Exception e) {
            log.error("Erro ao rastrear visualização de página", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao rastrear visualização de página"));
        }
    }

    @PostMapping("/track/module-view")
    public ResponseEntity<ApiResponse<Void>> trackModuleView(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TrackModuleViewRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            String userAgent = httpRequest.getHeader("User-Agent");
            String ipAddress = getClientIpAddress(httpRequest);
            
            userActivityTrackingService.trackModuleView(
                user,
                request.getModuleId(),
                request.getModuleTitle(),
                request.getCategory(),
                request.getTimeSpent(),
                request.getSessionId(),
                userAgent,
                ipAddress
            );
            
            return ResponseEntity.ok(ApiResponse.success("Módulo visualizado rastreado com sucesso", null));
        } catch (Exception e) {
            log.error("Erro ao rastrear visualização de módulo", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao rastrear visualização de módulo"));
        }
    }

    @PostMapping("/track/module-completion")
    public ResponseEntity<ApiResponse<Void>> trackModuleCompletion(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TrackModuleCompletionRequest request) {
        
        try {
            userActivityTrackingService.trackModuleCompletion(
                user,
                request.getModuleId(),
                request.getModuleTitle(),
                request.getCategory(),
                request.getTimeSpent(),
                request.getCompletionPercentage(),
                request.getSessionId()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Módulo completado rastreado com sucesso", null));
        } catch (Exception e) {
            log.error("Erro ao rastrear conclusão de módulo", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao rastrear conclusão de módulo"));
        }
    }

    @PostMapping("/session/start")
    public ResponseEntity<ApiResponse<String>> startSession(
            @AuthenticationPrincipal User user,
            HttpServletRequest httpRequest) {
        
        try {
            String userAgent = httpRequest.getHeader("User-Agent");
            String ipAddress = getClientIpAddress(httpRequest);
            
            String sessionId = userActivityTrackingService.startSession(user, userAgent, ipAddress);
            
            if (sessionId != null) {
                return ResponseEntity.ok(ApiResponse.success("Sessão iniciada com sucesso", sessionId));
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Erro ao iniciar sessão"));
            }
        } catch (Exception e) {
            log.error("Erro ao iniciar sessão", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao iniciar sessão"));
        }
    }

    @PostMapping("/session/end")
    public ResponseEntity<ApiResponse<Void>> endSession(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody EndSessionRequest request) {
        
        try {
            userActivityTrackingService.endSession(request.getSessionId(), request.getTotalTimeSpent());
            
            return ResponseEntity.ok(ApiResponse.success("Sessão finalizada com sucesso", null));
        } catch (Exception e) {
            log.error("Erro ao finalizar sessão", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao finalizar sessão"));
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
