package br.rafaalmeida1.nutri_thata_api.dto.request.linkpage;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateLinkPageProfileRequest {

    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String displayName;

    @Size(max = 500, message = "Bio deve ter no máximo 500 caracteres")
    private String displayBio;

    @Size(max = 150, message = "Título deve ter no máximo 150 caracteres")
    private String displayTitle;

    @Size(max = 500, message = "URL da imagem deve ter no máximo 500 caracteres")
    private String displayImageUrl;

    @Size(max = 500, message = "URL da imagem de fundo deve ter no máximo 500 caracteres")
    private String backgroundImageUrl;

    private Integer backgroundPositionX;

    private Integer backgroundPositionY;

    // Cores da página
    @Size(max = 7, message = "Cor deve estar no formato #RRGGBB")
    private String pagePrimaryColor;

    @Size(max = 7, message = "Cor deve estar no formato #RRGGBB")
    private String pageSecondaryColor;

    @Size(max = 7, message = "Cor deve estar no formato #RRGGBB")
    private String pageBackgroundColor;

    @Size(max = 7, message = "Cor deve estar no formato #RRGGBB")
    private String pageSurfaceColor;

    @Size(max = 7, message = "Cor deve estar no formato #RRGGBB")
    private String pageTextPrimaryColor;

    @Size(max = 7, message = "Cor deve estar no formato #RRGGBB")
    private String pageTextSecondaryColor;

    @Size(max = 7, message = "Cor deve estar no formato #RRGGBB")
    private String pageBorderColor;

    @Size(max = 7, message = "Cor deve estar no formato #RRGGBB")
    private String pageHoverColor;

    private Boolean useSiteColors;

    // Configurações de exibição
    private Boolean showProfileImage;

    private Boolean showTitle;

    private Boolean showBio;

    private Boolean showBranding;

    @Size(max = 100, message = "Texto de branding deve ter no máximo 100 caracteres")
    private String customBrandingText;

    // SEO
    @Size(max = 60, message = "Meta título deve ter no máximo 60 caracteres")
    private String metaTitle;

    @Size(max = 160, message = "Meta descrição deve ter no máximo 160 caracteres")
    private String metaDescription;

    // Acesso
    private Boolean isPublic;

    private Boolean passwordProtected;

    @Size(max = 255, message = "Senha deve ter no máximo 255 caracteres")
    private String accessPassword;
}
