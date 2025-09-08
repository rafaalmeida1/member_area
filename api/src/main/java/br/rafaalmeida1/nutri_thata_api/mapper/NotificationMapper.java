package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.NotificationResponse;
import br.rafaalmeida1.nutri_thata_api.entities.Notification;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class NotificationMapper {

    public NotificationResponse toNotificationResponse(Notification notification) {
        if (notification == null) {
            return null;
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .moduleId(notification.getModuleId())
                .moduleTitle(notification.getModuleTitle())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }

    public List<NotificationResponse> toNotificationResponseList(List<Notification> notifications) {
        if (notifications == null) {
            return null;
        }

        return notifications.stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());
    }
}