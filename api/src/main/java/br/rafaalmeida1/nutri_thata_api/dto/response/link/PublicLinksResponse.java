package br.rafaalmeida1.nutri_thata_api.dto.response.link;

import lombok.Data;

import java.util.List;

@Data
public class PublicLinksResponse {
    private Long professionalId;
    private String name;
    private String title;
    private String bio;
    private String image;
    private String backgroundImage;
    private Integer backgroundPositionX;
    private Integer backgroundPositionY;
    private String themePrimaryColor;
    private String themeSecondaryColor;
    private String themeBackgroundColor;
    private String themeSurfaceColor;
    private String themeTextPrimaryColor;
    private String themeTextSecondaryColor;
    private String themeBorderColor;
    private String themeHoverColor;
    private String themeDisabledColor;
    private List<PublicLinkResponse> links;
}
