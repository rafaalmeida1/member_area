package br.rafaalmeida1.nutri_thata_api.dto.request.media;

import br.rafaalmeida1.nutri_thata_api.enums.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaLinkRequest {

    @NotBlank(message = "URL é obrigatória")
    @URL(message = "URL deve ter um formato válido")
    private String url;

    @NotNull(message = "Tipo de mídia é obrigatório")
    private MediaType type;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }
}