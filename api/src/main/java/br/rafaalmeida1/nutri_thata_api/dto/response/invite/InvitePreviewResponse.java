package br.rafaalmeida1.nutri_thata_api.dto.response.invite;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitePreviewResponse {

    private String email;
    private Map<String, Object> prefill;
    private Boolean isValid;
    private LocalDateTime expiresAt;
    private CreatedByInfo createdBy;
    private String name;
    private String phone;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatedByInfo {
        private Long id;
        private String name;
    }
}