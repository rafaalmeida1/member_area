package br.rafaalmeida1.nutri_thata_api.dto.response.module;

import br.rafaalmeida1.nutri_thata_api.enums.ContentType;
import br.rafaalmeida1.nutri_thata_api.enums.ContentVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleResponse {

    private UUID id;
    private String title;
    private String description;
    private String coverImage;
    private String category;
    private List<ContentBlockResponse> content;
    private ContentVisibility visibility;
    private List<AllowedPatientInfo> allowedPatients;
    private CreatedByInfo createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContentBlockResponse {
        private UUID id;
        private ContentType type;
        private String content;
        private Integer order;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatedByInfo {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllowedPatientInfo {
        private Long id;
        private String name;
        private String email;
    }
}