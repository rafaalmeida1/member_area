package br.rafaalmeida1.nutri_thata_api.dto.response.module;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleSummaryResponse {

    private UUID id;
    private String title;
    private String description;
    private String coverImage;
    private String category;
    private Integer contentCount;
    private CreatedByInfo createdBy;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatedByInfo {
        private Long id;
        private String name;
    }
}