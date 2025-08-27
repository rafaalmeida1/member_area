package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.user.ChangePasswordRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.user.UpdateUserRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.user.UserResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.user.UserStatsResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.service.UserService;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal User user) {
        
        UserResponse userResponse = userService.getCurrentUser(user);
        return ResponseEntity.ok(ApiResponse.success("Perfil do usuário", userResponse));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateUserRequest request) {
        
        UserResponse userResponse = userService.updateCurrentUser(user, request);
        return ResponseEntity.ok(ApiResponse.success("Perfil atualizado com sucesso", userResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        UserResponse userResponse = userService.getUserById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Dados do usuário", userResponse));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal User currentUser) {
        
        UserResponse userResponse = userService.updateUser(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Usuário atualizado com sucesso", userResponse));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        
        userService.deleteUser(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Usuário excluído com sucesso", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        userService.changePassword(user, request);
        return ResponseEntity.ok(ApiResponse.success("Senha alterada com sucesso", null));
    }

    @GetMapping("/patients/list")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPatientsList(@AuthenticationPrincipal User user) {
        log.info("Solicitação de lista de pacientes por usuário: {}", user.getEmail());
        log.info("Role do usuário: {}", user.getRole());
        
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            log.warn("Acesso negado para usuário: {} com role: {}", user.getEmail(), user.getRole());
            return ResponseEntity.status(403).body(ApiResponse.error("Acesso negado"));
        }
        
        List<UserResponse> patients = userService.getPatientsList();
        log.info("Pacientes retornados: {}", patients.size());
        return ResponseEntity.ok(ApiResponse.success("Lista de pacientes", patients));
    }

    @GetMapping("/patients/stats")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPatientsWithStats(@AuthenticationPrincipal User user) {
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Acesso negado"));
        }
        
        List<UserResponse> patients = userService.getPatientsWithStats();
        return ResponseEntity.ok(ApiResponse.success("Lista de pacientes com estatísticas", patients));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats(@AuthenticationPrincipal User user) {
        UserStatsResponse stats = userService.getUserStats(user);
        return ResponseEntity.ok(ApiResponse.success("Estatísticas do usuário", stats));
    }

    @GetMapping("/patients/debug")
    public ResponseEntity<ApiResponse<Object>> getPatientsDebug(@AuthenticationPrincipal User user) {
        log.info("Debug - Usuário solicitante: {}", user.getEmail());
        log.info("Debug - Role do usuário: {}", user.getRole());
        
        // Contar todos os usuários
        long totalUsers = userRepository.count();
        log.info("Debug - Total de usuários: {}", totalUsers);
        
        // Contar pacientes
        long totalPatients = userRepository.countByRole(Role.PATIENT);
        log.info("Debug - Total de pacientes: {}", totalPatients);
        
        // Listar alguns pacientes para debug
        List<User> samplePatients = userRepository.findByRoleAndIsActiveTrue(Role.PATIENT);
        log.info("Debug - Amostra de pacientes: {}", samplePatients.size());
        
        return ResponseEntity.ok(ApiResponse.success("Debug info", Map.of(
            "totalUsers", totalUsers,
            "totalPatients", totalPatients,
            "activePatients", samplePatients.size(),
            "sampleSize", samplePatients.size()
        )));
    }
}