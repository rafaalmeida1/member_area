package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.NotificationResponse;
import br.rafaalmeida1.nutri_thata_api.entities.Notification;
import br.rafaalmeida1.nutri_thata_api.enums.NotificationType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NotificationMapper {
    
    public NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        
        return new NotificationResponse(
            notification.getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.isRead(),
            notification.getModuleId(),
            notification.getModuleTitle(),
            notification.getCreatedAt()
        );
    }
    
    public List<NotificationResponse> toResponseList(List<Notification> notifications) {
        if (notifications == null) {
            return null;
        }
        
        return notifications.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
} 