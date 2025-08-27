package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.NotificationResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
            @AuthenticationPrincipal User user) {
        try {
            List<NotificationResponse> notifications = notificationService.getUserNotifications(user);
            return ResponseEntity.ok(ApiResponse.success("Notificações carregadas com sucesso", notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao carregar notificações: " + e.getMessage()));
        }
    }
    
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(
            @AuthenticationPrincipal User user) {
        try {
            List<NotificationResponse> notifications = notificationService.getUnreadNotifications(user);
            return ResponseEntity.ok(ApiResponse.success("Notificações não lidas carregadas com sucesso", notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao carregar notificações não lidas: " + e.getMessage()));
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getAllNotifications(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<NotificationResponse> notifications = notificationService.getAllNotifications(user, pageable);
        return ResponseEntity.ok(ApiResponse.success("Todas as notificações", notifications));
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        try {
            long count = notificationService.getUnreadCount(user);
            return ResponseEntity.ok(ApiResponse.success("Contador carregado com sucesso", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao carregar contador: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            notificationService.markAsRead(id, user);
            return ResponseEntity.ok(ApiResponse.success("Notificação marcada como lida", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao marcar como lida: " + e.getMessage()));
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal User user) {
        try {
            notificationService.markAllAsRead(user);
            return ResponseEntity.ok(ApiResponse.success("Todas as notificações marcadas como lidas", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Erro ao marcar todas como lidas: " + e.getMessage()));
        }
    }
} 