package br.rafaalmeida1.nutri_thata_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionalProfileResponse {

    private Long id;
    private String name;
    private String title;
    private String bio;
    private String image;
    private String backgroundImage;
    private Integer backgroundPositionX;
    private Integer backgroundPositionY;

    // Cores personalizadas do tema
    private String themePrimaryColor;
    private String themeSecondaryColor;
    private String themeAccentColor;
    private String themeBackgroundColor;
    private String themeSurfaceColor;
    private String themeTextColor;
    private String themeTextSecondaryColor;
    private String themeBorderColor;
    private String themeMutedColor;
    private String themeShadowColor;
    private String themeOverlayColor;

    private List<String> specialties;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}