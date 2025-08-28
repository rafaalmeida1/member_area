package br.rafaalmeida1.nutri_thata_api.dto.request.module;

import br.rafaalmeida1.nutri_thata_api.enums.ContentType;
import jakarta.validation.Valid;
import br.rafaalmeida1.nutri_thata_api.enums.ContentVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateModuleRequest {

    private String title;
    private String description;
    private String coverImage;
    private String category;

    @Valid
    private List<ContentBlockUpdateData> content;

    private ContentVisibility visibility;
    private List<Long> allowedPatientIds;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<ContentBlockUpdateData> getContent() {
        return content;
    }

    public void setContent(List<ContentBlockUpdateData> content) {
        this.content = content;
    }

    public ContentVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(ContentVisibility visibility) {
        this.visibility = visibility;
    }

    public List<Long> getAllowedPatientIds() {
        return allowedPatientIds;
    }

    public void setAllowedPatientIds(List<Long> allowedPatientIds) {
        this.allowedPatientIds = allowedPatientIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContentBlockUpdateData {
        private UUID id; // null para novos blocos
        private ContentType type;
        private String content;
        private Integer order;

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public ContentType getType() {
            return type;
        }

        public void setType(ContentType type) {
            this.type = type;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Integer getOrder() {
            return order;
        }

        public void setOrder(Integer order) {
            this.order = order;
        }
    }
}