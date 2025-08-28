package br.rafaalmeida1.nutri_thata_api.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "professional_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ProfessionalProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String name;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String image;

    @Column(name = "background_image")
    private String backgroundImage;

    // Posição da imagem de fundo (percentual 0-100)
    @Column(name = "background_position_x")
    private Integer backgroundPositionX;

    @Column(name = "background_position_y")
    private Integer backgroundPositionY;

    // Cores personalizadas do tema
    @Column(name = "theme_primary_color")
    private String themePrimaryColor;

    @Column(name = "theme_secondary_color")
    private String themeSecondaryColor;

    @Column(name = "theme_accent_color")
    private String themeAccentColor;

    @Column(name = "theme_background_color")
    private String themeBackgroundColor;

    @Column(name = "theme_surface_color")
    private String themeSurfaceColor;

    @Column(name = "theme_text_color")
    private String themeTextColor;

    @Column(name = "theme_text_secondary_color")
    private String themeTextSecondaryColor;

    @Column(name = "theme_border_color")
    private String themeBorderColor;

    @Column(name = "theme_muted_color")
    private String themeMutedColor;

    @Column(name = "theme_shadow_color")
    private String themeShadowColor;

    @Column(name = "theme_overlay_color")
    private String themeOverlayColor;


    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "professional_specialties",
        joinColumns = @JoinColumn(name = "professional_id")
    )
    @Column(name = "specialty")
    @Builder.Default
    private List<String> specialties = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getBackgroundImage() {
        return backgroundImage;
    }

    public void setBackgroundImage(String backgroundImage) {
        this.backgroundImage = backgroundImage;
    }

    public Integer getBackgroundPositionX() {
        return backgroundPositionX;
    }

    public void setBackgroundPositionX(Integer backgroundPositionX) {
        this.backgroundPositionX = backgroundPositionX;
    }

    public Integer getBackgroundPositionY() {
        return backgroundPositionY;
    }

    public void setBackgroundPositionY(Integer backgroundPositionY) {
        this.backgroundPositionY = backgroundPositionY;
    }

    public String getThemePrimaryColor() {
        return themePrimaryColor;
    }

    public void setThemePrimaryColor(String themePrimaryColor) {
        this.themePrimaryColor = themePrimaryColor;
    }

    public String getThemeSecondaryColor() {
        return themeSecondaryColor;
    }

    public void setThemeSecondaryColor(String themeSecondaryColor) {
        this.themeSecondaryColor = themeSecondaryColor;
    }

    public String getThemeAccentColor() {
        return themeAccentColor;
    }

    public void setThemeAccentColor(String themeAccentColor) {
        this.themeAccentColor = themeAccentColor;
    }

    public String getThemeBackgroundColor() {
        return themeBackgroundColor;
    }

    public void setThemeBackgroundColor(String themeBackgroundColor) {
        this.themeBackgroundColor = themeBackgroundColor;
    }

    public String getThemeSurfaceColor() {
        return themeSurfaceColor;
    }

    public void setThemeSurfaceColor(String themeSurfaceColor) {
        this.themeSurfaceColor = themeSurfaceColor;
    }

    public String getThemeTextColor() {
        return themeTextColor;
    }

    public void setThemeTextColor(String themeTextColor) {
        this.themeTextColor = themeTextColor;
    }

    public String getThemeTextSecondaryColor() {
        return themeTextSecondaryColor;
    }

    public void setThemeTextSecondaryColor(String themeTextSecondaryColor) {
        this.themeTextSecondaryColor = themeTextSecondaryColor;
    }

    public String getThemeBorderColor() {
        return themeBorderColor;
    }

    public void setThemeBorderColor(String themeBorderColor) {
        this.themeBorderColor = themeBorderColor;
    }

    public String getThemeMutedColor() {
        return themeMutedColor;
    }

    public void setThemeMutedColor(String themeMutedColor) {
        this.themeMutedColor = themeMutedColor;
    }

    public String getThemeShadowColor() {
        return themeShadowColor;
    }

    public void setThemeShadowColor(String themeShadowColor) {
        this.themeShadowColor = themeShadowColor;
    }

    public String getThemeOverlayColor() {
        return themeOverlayColor;
    }

    public void setThemeOverlayColor(String themeOverlayColor) {
        this.themeOverlayColor = themeOverlayColor;
    }


    public List<String> getSpecialties() {
        return specialties;
    }

    public void setSpecialties(List<String> specialties) {
        this.specialties = specialties;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}