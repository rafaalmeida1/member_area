package br.rafaalmeida1.nutri_thata_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfessionalProfileRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100, message = "Nome deve ter entre 2 e 100 caracteres")
    private String name;

    @NotBlank(message = "Título é obrigatório")
    @Size(min = 2, max = 100, message = "Título deve ter entre 2 e 100 caracteres")
    private String title;

    @Size(max = 1000, message = "Bio deve ter no máximo 1000 caracteres")
    private String bio;

    private String image;

    private String backgroundImage;

    // Novos campos para posicionamento da imagem de fundo (0-100)
    private Integer backgroundPositionX;
    private Integer backgroundPositionY;

    // Cores personalizadas do tema (esquema simplificado)
    private String themePrimaryColor;
    private String themeSecondaryColor;
    private String themeBackgroundColor;
    private String themeSurfaceColor;
    private String themeTextPrimaryColor;
    private String themeTextSecondaryColor;
    private String themeBorderColor;
    private String themeHoverColor;
    private String themeDisabledColor;

    private List<String> specialties;

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

    public String getThemeTextPrimaryColor() {
        return themeTextPrimaryColor;
    }

    public void setThemeTextPrimaryColor(String themeTextPrimaryColor) {
        this.themeTextPrimaryColor = themeTextPrimaryColor;
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

    public String getThemeHoverColor() {
        return themeHoverColor;
    }

    public void setThemeHoverColor(String themeHoverColor) {
        this.themeHoverColor = themeHoverColor;
    }

    public String getThemeDisabledColor() {
        return themeDisabledColor;
    }

    public void setThemeDisabledColor(String themeDisabledColor) {
        this.themeDisabledColor = themeDisabledColor;
    }


    public List<String> getSpecialties() {
        return specialties;
    }

    public void setSpecialties(List<String> specialties) {
        this.specialties = specialties;
    }
}