package br.rafaalmeida1.nutri_thata_api.dto.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackModuleViewRequest {

    @NotNull(message = "ID do módulo é obrigatório")
    @Positive(message = "ID do módulo deve ser positivo")
    private Long moduleId;

    @NotBlank(message = "Título do módulo é obrigatório")
    private String moduleTitle;

    @NotBlank(message = "Categoria é obrigatória")
    private String category;

    @NotNull(message = "Tempo gasto é obrigatório")
    @Min(value = 0, message = "Tempo gasto deve ser maior ou igual a zero")
    private Long timeSpent; // em segundos

    @NotBlank(message = "ID da sessão é obrigatório")
    private String sessionId;
}
