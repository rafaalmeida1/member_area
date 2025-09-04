package br.rafaalmeida1.nutri_thata_api.dto.request.link;

import br.rafaalmeida1.nutri_thata_api.enums.LinkType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateLinkRequest {

    @NotBlank(message = "Título é obrigatório")
    private String title;

    private String description;

    @NotBlank(message = "URL é obrigatória")
    private String url;

    @NotNull(message = "Tipo do link é obrigatório")
    private LinkType linkType;

    private String icon;

    private String whatsappMessage;

    private Integer displayOrder;

    private Boolean displayAsIcon = false;

    private Boolean isActive = true;
}
