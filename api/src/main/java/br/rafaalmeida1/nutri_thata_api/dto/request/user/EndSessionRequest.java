package br.rafaalmeida1.nutri_thata_api.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndSessionRequest {

    @NotBlank(message = "ID da sessão é obrigatório")
    private String sessionId;

    @NotNull(message = "Tempo total gasto é obrigatório")
    @PositiveOrZero(message = "Tempo total gasto deve ser positivo ou zero")
    private Long totalTimeSpent; // em segundos
}
