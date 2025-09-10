package br.rafaalmeida1.nutri_thata_api.dto.request.user;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
public class StartSessionRequest {
    // Este DTO pode ser expandido no futuro se necessário
    // Por enquanto, as informações são extraídas do request HTTP
}
