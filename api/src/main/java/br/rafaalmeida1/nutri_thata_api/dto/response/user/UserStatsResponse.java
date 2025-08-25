package br.rafaalmeida1.nutri_thata_api.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    private Long id;
    private Integer totalModulesViewed;
    private Integer totalTimeSpent; // em minutos
    private String lastActivity;
    private Integer modulesCompleted;
    private Integer averageSessionTime;
    private List<String> favoriteCategories;
    private Integer progressPercentage;
    private List<WeeklyActivity> weeklyActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyActivity {
        private String date;
        private Integer modulesViewed;
        private Integer timeSpent;
    }
} 