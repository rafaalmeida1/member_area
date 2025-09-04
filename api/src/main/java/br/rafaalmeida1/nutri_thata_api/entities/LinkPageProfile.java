package br.rafaalmeida1.nutri_thata_api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "link_page_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkPageProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "professional_profile_id", nullable = false)
    private ProfessionalProfile professionalProfile;

    // Configurações visuais
    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "display_bio", length = 500)
    private String displayBio;

    @Column(name = "display_title", length = 150)
    private String displayTitle;

    // Imagem personalizada para a página de links (diferente da foto do perfil)
    @Column(name = "display_image_url", length = 500)
    private String displayImageUrl;

    // Background personalizado
    @Column(name = "background_image_url", length = 500)
    private String backgroundImageUrl;

    @Column(name = "background_position_x")
    @Builder.Default
    private Integer backgroundPositionX = 50;

    @Column(name = "background_position_y")
    @Builder.Default
    private Integer backgroundPositionY = 50;

    // Cores personalizadas da página de links (separadas das cores do site)
    @Column(name = "page_primary_color", length = 7)
    private String pagePrimaryColor;

    @Column(name = "page_secondary_color", length = 7)
    private String pageSecondaryColor;

    @Column(name = "page_background_color", length = 7)
    private String pageBackgroundColor;

    @Column(name = "page_surface_color", length = 7)
    private String pageSurfaceColor;

    @Column(name = "page_text_primary_color", length = 7)
    private String pageTextPrimaryColor;

    @Column(name = "page_text_secondary_color", length = 7)
    private String pageTextSecondaryColor;

    @Column(name = "page_border_color", length = 7)
    private String pageBorderColor;

    @Column(name = "page_hover_color", length = 7)
    private String pageHoverColor;

    // Flag para usar cores do site principal
    @Column(name = "use_site_colors")
    @Builder.Default
    private Boolean useSiteColors = false;

    // Configurações de layout
    @Column(name = "show_profile_image")
    @Builder.Default
    private Boolean showProfileImage = true;

    @Column(name = "show_title")
    @Builder.Default
    private Boolean showTitle = true;

    @Column(name = "show_bio")
    @Builder.Default
    private Boolean showBio = true;

    // Configurações de branding
    @Column(name = "show_branding")
    @Builder.Default
    private Boolean showBranding = true;

    @Column(name = "custom_branding_text", length = 100)
    private String customBrandingText;

    // SEO
    @Column(name = "meta_title", length = 60)
    private String metaTitle;

    @Column(name = "meta_description", length = 160)
    private String metaDescription;

    // Controle de acesso
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    @Column(name = "password_protected")
    @Builder.Default
    private Boolean passwordProtected = false;

    @Column(name = "access_password", length = 255)
    private String accessPassword;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
