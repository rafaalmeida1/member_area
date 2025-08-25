package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.UpdateProfessionalProfileRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.ProfessionalProfileResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.ProfessionalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/professional")
@RequiredArgsConstructor
public class ProfessionalController {

    private final ProfessionalService professionalService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ResponseEntity<ApiResponse<ProfessionalProfileResponse>> getMyProfile(
            @AuthenticationPrincipal User user) {
        
        ProfessionalProfileResponse response = professionalService.getProfessionalProfile(user);
        return ResponseEntity.ok(ApiResponse.success("Perfil profissional encontrado", response));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('PROFESSIONAL')")
    public ResponseEntity<ApiResponse<ProfessionalProfileResponse>> updateProfile(
            @RequestBody UpdateProfessionalProfileRequest request,
            @AuthenticationPrincipal User user) {
        
        ProfessionalProfileResponse response = professionalService.updateProfessionalProfile(user, request);
        return ResponseEntity.ok(ApiResponse.success("Perfil profissional atualizado com sucesso", response));
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ApiResponse<ProfessionalProfileResponse>> getProfessionalProfileById(
            @PathVariable Long userId) {
        
        ProfessionalProfileResponse response = professionalService.getProfessionalProfileById(userId);
        return ResponseEntity.ok(ApiResponse.success("Perfil profissional encontrado", response));
    }

    @GetMapping("/banner")
    public ResponseEntity<ApiResponse<ProfessionalProfileResponse>> getBannerData(
            @AuthenticationPrincipal User user) {
        
        ProfessionalProfileResponse response = professionalService.getBannerData(user);
        return ResponseEntity.ok(ApiResponse.success("Dados do banner encontrados", response));
    }
}