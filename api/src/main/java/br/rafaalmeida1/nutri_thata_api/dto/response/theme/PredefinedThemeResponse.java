package br.rafaalmeida1.nutri_thata_api.dto.response.theme;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredefinedThemeResponse {
    private String id;
    private String name;
    private String description;
    private String previewColor;
    private ThemeColorsResponse colors;
}
