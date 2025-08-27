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
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Acesso negado"));
        }
        
        List<UserResponse> patients = userService.getPatientsList();
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
}