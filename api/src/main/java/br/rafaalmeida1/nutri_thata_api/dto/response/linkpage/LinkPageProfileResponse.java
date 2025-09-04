package br.rafaalmeida1.nutri_thata_api.dto.response.linkpage;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LinkPageProfileResponse {

    private Long id;

    private String displayName;

    private String displayBio;

    private String displayTitle;

    private String displayImageUrl;

    private String backgroundImageUrl;

    private Integer backgroundPositionX;

    private Integer backgroundPositionY;

    // Cores da página
    private String pagePrimaryColor;

    private String pageSecondaryColor;

    private String pageBackgroundColor;

    private String pageSurfaceColor;

    private String pageTextPrimaryColor;

    private String pageTextSecondaryColor;

    private String pageBorderColor;

    private String pageHoverColor;

    private Boolean useSiteColors;

    // Configurações de exibição
    private Boolean showProfileImage;

    private Boolean showTitle;

    private Boolean showBio;

    private Boolean showBranding;

    private String customBrandingText;

    // SEO
    private String metaTitle;

    private String metaDescription;

    // Acesso
    private Boolean isPublic;

    private Boolean passwordProtected;

    // Timestamps
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
