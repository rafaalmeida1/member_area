package br.rafaalmeida1.nutri_thata_api.dto.response.link;

import br.rafaalmeida1.nutri_thata_api.enums.LinkType;
import lombok.Data;

@Data
public class PublicLinkResponse {
    private Long id;
    private String title;
    private String description;
    private String url;
    private LinkType linkType;
    private String icon;
    private String whatsappMessage;
    private Integer displayOrder;
}
