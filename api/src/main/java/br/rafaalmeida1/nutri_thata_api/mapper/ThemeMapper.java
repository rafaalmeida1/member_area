package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.theme.ThemeColorsResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import org.springframework.stereotype.Component;

@Component
public class ThemeMapper {

    public ThemeColorsResponse toThemeColorsResponse(User user) {
        if (user == null) {
            return null;
        }

        return ThemeColorsResponse.builder()
                .themePrimaryColor(user.getThemePrimaryColor())
                .themeSecondaryColor(user.getThemeSecondaryColor())
                .themeAccentColor(user.getThemeAccentColor())
                .themeBackgroundColor(user.getThemeBackgroundColor())
                .themeSurfaceColor(user.getThemeSurfaceColor())
                .themeTextColor(user.getThemeTextColor())
                .themeTextSecondaryColor(user.getThemeTextSecondaryColor())
                .themeBorderColor(user.getThemeBorderColor())
                .themeInputBgColor(user.getThemeInputBgColor())
                .themeInputBorderColor(user.getThemeInputBorderColor())
                .themeInputFocusColor(user.getThemeInputFocusColor())
                .themeButtonPrimaryBg(user.getThemeButtonPrimaryBg())
                .themeButtonPrimaryHover(user.getThemeButtonPrimaryHover())
                .themeButtonPrimaryText(user.getThemeButtonPrimaryText())
                .themeButtonSecondaryBg(user.getThemeButtonSecondaryBg())
                .themeButtonSecondaryHover(user.getThemeButtonSecondaryHover())
                .themeButtonSecondaryText(user.getThemeButtonSecondaryText())
                .themeButtonDisabledBg(user.getThemeButtonDisabledBg())
                .themeButtonDisabledText(user.getThemeButtonDisabledText())
                .themeSuccessColor(user.getThemeSuccessColor())
                .themeWarningColor(user.getThemeWarningColor())
                .themeErrorColor(user.getThemeErrorColor())
                .themeInfoColor(user.getThemeInfoColor())
                .selectedTheme(user.getSelectedTheme())
                .build();
    }
}
