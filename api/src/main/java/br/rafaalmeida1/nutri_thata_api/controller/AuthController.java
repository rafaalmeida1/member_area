package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.ForgotPasswordRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.ResetPasswordRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.auth.LoginRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.auth.PatientRegisterRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.auth.AuthResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.user.UserResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.mapper.UserMapper;
import br.rafaalmeida1.nutri_thata_api.service.AuthService;
import br.rafaalmeida1.nutri_thata_api.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register/patient")
    public ResponseEntity<ApiResponse<AuthResponse>> registerPatient(
            @Valid @RequestBody PatientRegisterRequest request) {
        
        AuthResponse response = authService.registerPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Paciente registrado com sucesso", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken(
            @RequestHeader("Authorization") String refreshToken) {
        
        if (refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        
        String newToken = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token renovado com sucesso", newToken));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal User user) {
        
        UserResponse userResponse = userMapper.toUserResponse(user);
        return ResponseEntity.ok(ApiResponse.success("Dados do usuário", userResponse));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        
        passwordResetService.sendPasswordResetEmail(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
            "Se o email existir em nossa base, você receberá um link para redefinir sua senha.", 
            null
        ));
    }

    @GetMapping("/reset-password/validate/{token}")
    public ResponseEntity<ApiResponse<String>> validateResetToken(
            @PathVariable String token) {
        
        passwordResetService.validateResetToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token válido", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Senha redefinida com sucesso", null));
    }
}