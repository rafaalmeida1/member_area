package br.rafaalmeida1.nutri_thata_api.dto.response.analytics;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserClickResponse {
    private Long userId;
    private String userName;
    private String userEmail;
    private Long totalClicks;
    private Long totalViews;
    private LocalDateTime lastActivityAt;
}
