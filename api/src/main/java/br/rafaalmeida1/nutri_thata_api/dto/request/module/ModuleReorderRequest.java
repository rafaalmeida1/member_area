package br.rafaalmeida1.nutri_thata_api.dto.request.module;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleReorderRequest {
    private UUID moduleId;
    private Integer newOrderIndex;
} 