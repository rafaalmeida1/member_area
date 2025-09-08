package br.rafaalmeida1.nutri_thata_api.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfessionalInfoResponse {
    private String name;
    private String title;
    private String bio;
    private List<String> specialties;
    private String image;
    private String backgroundImage;
}
