package br.rafaalmeida1.nutri_thata_api.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    // Estatísticas para profissionais
    private Integer totalPatients;
    private Integer activePatients;
    private Integer totalModules;
    private Integer activeModules;
    private Integer totalInvites;
    private Integer invitesThisMonth;
    private Integer totalViews;
    
    // Estatísticas para pacientes
    private Integer viewedModules;
    private Integer completedModules;
    private Integer totalStudyTime; // em minutos
}
