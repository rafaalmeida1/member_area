package br.rafaalmeida1.nutri_thata_api.dto.request.invite;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInviteRequest {

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter um formato válido")
    private String email;

    private Map<String, Object> prefill;

    public String getEmail() {
        return this.email;
    }

    public Map<String, Object> getPrefill() {
        return this.prefill;
    }
}