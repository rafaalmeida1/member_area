package br.rafaalmeida1.nutri_thata_api.dto.response.analytics;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ClicksByDateResponse {
    private LocalDate date;
    private Long clicks;
    private Long uniqueClicks;
}
