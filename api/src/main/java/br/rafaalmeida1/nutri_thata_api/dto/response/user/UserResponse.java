package br.rafaalmeida1.nutri_thata_api.dto.response.user;

import br.rafaalmeida1.nutri_thata_api.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
}