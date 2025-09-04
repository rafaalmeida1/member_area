package br.rafaalmeida1.nutri_thata_api.dto.response.link;

import br.rafaalmeida1.nutri_thata_api.enums.LinkType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LinkResponse {
    private Long id;
    private String title;
    private String description;
    private String url;
    private LinkType linkType;
    private String icon;
    private String whatsappMessage;
    private Integer displayOrder;
    private Boolean isActive;
    private Long clickCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
