package br.rafaalmeida1.nutri_thata_api.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackActivityRequest {

    @NotBlank(message = "Caminho da página é obrigatório")
    private String pagePath;

    @NotBlank(message = "ID da sessão é obrigatório")
    private String sessionId;
}
