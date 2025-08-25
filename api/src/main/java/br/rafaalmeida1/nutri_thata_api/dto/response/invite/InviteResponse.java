package br.rafaalmeida1.nutri_thata_api.dto.response.invite;

import br.rafaalmeida1.nutri_thata_api.enums.InviteStatus;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InviteResponse {

    private UUID id;
    private String email;
    private Role role;
    private Map<String, Object> prefill;
    private InviteStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime acceptedAt;
    private CreatedByInfo createdBy;
    private LocalDateTime createdAt;
    private String fullLink;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatedByInfo {
        private Long id;
        private String name;
    }
}