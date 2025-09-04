package br.rafaalmeida1.nutri_thata_api.dto.response.analytics;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ViewsByDateResponse {
    private LocalDate date;
    private Long views;
    private Long uniqueViews;
}
