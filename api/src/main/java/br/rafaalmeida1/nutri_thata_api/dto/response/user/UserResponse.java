package br.rafaalmeida1.nutri_thata_api.dto.response.user;

import br.rafaalmeida1.nutri_thata_api.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate birthDate;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private PatientStats stats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientStats {
        private Integer totalModulesViewed;
        private Integer totalTimeSpent; // em minutos
        private Integer modulesCompleted;
        private Integer averageSessionTime; // em minutos
        private String lastActivity;
        private List<String> favoriteCategories;
        private Integer progressPercentage;
    }
}