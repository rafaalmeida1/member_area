package br.rafaalmeida1.nutri_thata_api.dto.request.auth;

import br.rafaalmeida1.nutri_thata_api.entities.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProfessionalRequest {

    @Valid
    @NotNull(message = "Dados do usuário são obrigatórios")
    private UserData user;

    @Valid
    @NotNull(message = "Dados profissionais são obrigatórios")
    private ProfessionalData professional;

    public UserData getUser() {
        return user;
    }

    public void setUser(UserData user) {
        this.user = user;
    }

    public ProfessionalData getProfessional() {
        return professional;
    }

    public void setProfessional(ProfessionalData professional) {
        this.professional = professional;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserData {
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 255, message = "Nome deve ter entre 2 e 255 caracteres")
        private String name;

        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ter um formato válido")
        private String email;

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, message = "Senha deve ter pelo menos 8 caracteres")
        private String password;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfessionalData {
        private String title;
        private String bio;
        private List<String> specialties;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getBio() {
            return bio;
        }

        public void setBio(String bio) {
            this.bio = bio;
        }

        public List<String> getSpecialties() {
            return specialties;
        }

        public void setSpecialties(List<String> specialties) {
            this.specialties = specialties;
        }
    }
}