package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.invite.AcceptInviteRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.invite.CreateInviteRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.auth.AuthResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.invite.InvitePreviewResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.invite.InviteResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.InviteStatus;
import br.rafaalmeida1.nutri_thata_api.service.InviteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/invites")
@RequiredArgsConstructor
public class InviteController {

    private final InviteService inviteService;

    @PostMapping
    public ResponseEntity<ApiResponse<InviteResponse>> createInvite(
            @Valid @RequestBody CreateInviteRequest request,
            @AuthenticationPrincipal User user) {
        
        InviteResponse response = inviteService.createInvite(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Convite enviado com sucesso", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<InviteResponse>>> getInvites(
            @RequestParam(required = false) InviteStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User user) {
        
        Page<InviteResponse> invites = inviteService.getInvitesByCreator(user, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lista de convites", invites));
    }

    @GetMapping("/{token}")
    public ResponseEntity<ApiResponse<InvitePreviewResponse>> getInviteByToken(
            @PathVariable String token) {
        
        InvitePreviewResponse response = inviteService.getInviteByToken(token);
        return ResponseEntity.ok(ApiResponse.success("Dados do convite", response));
    }

    @PostMapping("/{token}/accept")
    public ResponseEntity<ApiResponse<AuthResponse>> acceptInvite(
            @PathVariable String token,
            @Valid @RequestBody AcceptInviteRequest request) {
        
        AuthResponse response = inviteService.acceptInvite(token, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Conta criada com sucesso", response));
    }

    @PostMapping("/{id}/resend")
    public ResponseEntity<ApiResponse<Void>> resendInvite(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        
        inviteService.resendInvite(id, user);
        return ResponseEntity.ok(ApiResponse.success("Convite reenviado com sucesso", null));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelInvite(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        
        inviteService.cancelInvite(id, user);
        return ResponseEntity.ok(ApiResponse.success("Convite cancelado com sucesso", null));
    }
}