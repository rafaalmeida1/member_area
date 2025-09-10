package br.rafaalmeida1.nutri_thata_api.dto.response.theme;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeColorsResponse {
    private String message;
    private String themePrimaryColor;
    private String themeSecondaryColor;
    private String themeAccentColor;
    private String themeBackgroundColor;
    private String themeSurfaceColor;
    private String themeTextColor;
    private String themeTextSecondaryColor;
    private String themeBorderColor;
    private String themeInputBgColor;
    private String themeInputBorderColor;
    private String themeInputFocusColor;
    private String themeButtonPrimaryBg;
    private String themeButtonPrimaryHover;
    private String themeButtonPrimaryText;
    private String themeButtonSecondaryBg;
    private String themeButtonSecondaryHover;
    private String themeButtonSecondaryText;
    private String themeButtonDisabledBg;
    private String themeButtonDisabledText;
    private String themeSuccessColor;
    private String themeWarningColor;
    private String themeErrorColor;
    private String themeInfoColor;
    private String selectedTheme;
}
