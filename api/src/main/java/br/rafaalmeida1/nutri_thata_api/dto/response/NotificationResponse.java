package br.rafaalmeida1.nutri_thata_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String moduleId;
    private String moduleTitle;
    private Boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}