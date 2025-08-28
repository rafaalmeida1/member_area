package br.rafaalmeida1.nutri_thata_api.dto.request.module;

import br.rafaalmeida1.nutri_thata_api.enums.ContentType;
import jakarta.validation.Valid;
import br.rafaalmeida1.nutri_thata_api.enums.ContentVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.ArrayList;
import java.util.Objects;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateModuleRequest {

    @NotBlank(message = "Título é obrigatório")
    private String title;

    @NotBlank(message = "Descrição é obrigatória")
    private String description;

    private String coverImage;

    @NotBlank(message = "Categoria é obrigatória")
    private String category;

    private Integer orderIndex;

    @Valid
    @NotEmpty(message = "Conteúdo é obrigatório")
    private List<ContentBlockData> content;

    // Visibilidade e pacientes específicos
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

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public List<ContentBlockData> getContent() {
        return content;
    }

    public void setContent(List<ContentBlockData> content) {
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
    public static class ContentBlockData {
        @NotNull(message = "Tipo de conteúdo é obrigatório")
        private ContentType type;

        @NotBlank(message = "Conteúdo é obrigatório")
        private String content;

        @NotNull(message = "Ordem é obrigatória")
        @Positive(message = "Ordem deve ser um número positivo")
        private Integer order;

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