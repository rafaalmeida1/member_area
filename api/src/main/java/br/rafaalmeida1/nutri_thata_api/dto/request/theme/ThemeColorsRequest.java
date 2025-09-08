package br.rafaalmeida1.nutri_thata_api.dto.request.theme;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeColorsRequest {
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor primária deve ser um código hexadecimal válido")
    private String themePrimaryColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor secundária deve ser um código hexadecimal válido")
    private String themeSecondaryColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de destaque deve ser um código hexadecimal válido")
    private String themeAccentColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de fundo deve ser um código hexadecimal válido")
    private String themeBackgroundColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de superfície deve ser um código hexadecimal válido")
    private String themeSurfaceColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor do texto deve ser um código hexadecimal válido")
    private String themeTextColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor do texto secundário deve ser um código hexadecimal válido")
    private String themeTextSecondaryColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor da borda deve ser um código hexadecimal válido")
    private String themeBorderColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de fundo do input deve ser um código hexadecimal válido")
    private String themeInputBgColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor da borda do input deve ser um código hexadecimal válido")
    private String themeInputBorderColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de foco do input deve ser um código hexadecimal válido")
    private String themeInputFocusColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de fundo do botão primário deve ser um código hexadecimal válido")
    private String themeButtonPrimaryBg;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de hover do botão primário deve ser um código hexadecimal válido")
    private String themeButtonPrimaryHover;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor do texto do botão primário deve ser um código hexadecimal válido")
    private String themeButtonPrimaryText;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de fundo do botão secundário deve ser um código hexadecimal válido")
    private String themeButtonSecondaryBg;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de hover do botão secundário deve ser um código hexadecimal válido")
    private String themeButtonSecondaryHover;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor do texto do botão secundário deve ser um código hexadecimal válido")
    private String themeButtonSecondaryText;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de fundo do botão desabilitado deve ser um código hexadecimal válido")
    private String themeButtonDisabledBg;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor do texto do botão desabilitado deve ser um código hexadecimal válido")
    private String themeButtonDisabledText;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de sucesso deve ser um código hexadecimal válido")
    private String themeSuccessColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de aviso deve ser um código hexadecimal válido")
    private String themeWarningColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de erro deve ser um código hexadecimal válido")
    private String themeErrorColor;
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Cor de informação deve ser um código hexadecimal válido")
    private String themeInfoColor;
    
    private String selectedTheme;
}
