package br.rafaalmeida1.nutri_thata_api.dto.request.link;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ReorderLinksRequest {

    @NotEmpty(message = "Lista de IDs não pode estar vazia")
    private List<Long> linkIds;
}
