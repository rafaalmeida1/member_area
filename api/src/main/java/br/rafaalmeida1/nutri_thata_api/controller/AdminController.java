package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.auth.CreateProfessionalRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.auth.AuthResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AuthService authService;

    @PostMapping("/professionals")
    public ResponseEntity<ApiResponse<AuthResponse>> createProfessional(
            @Valid @RequestBody CreateProfessionalRequest request,
            @AuthenticationPrincipal User admin) {
        
        AuthResponse response = authService.createProfessional(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profissional criado com sucesso", response));
    }
}