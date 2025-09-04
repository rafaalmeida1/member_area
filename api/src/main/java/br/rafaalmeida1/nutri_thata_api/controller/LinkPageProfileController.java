package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.linkpage.UpdateLinkPageProfileRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.linkpage.LinkPageProfileResponse;
import br.rafaalmeida1.nutri_thata_api.service.LinkPageProfileService;
import br.rafaalmeida1.nutri_thata_api.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professional/link-page-profile")
@RequiredArgsConstructor
@Slf4j
public class LinkPageProfileController {

    private final LinkPageProfileService linkPageProfileService;
    private final JwtService jwtService;

    private Long extractUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractUserId(token);
        }
        throw new RuntimeException("Token não encontrado ou inválido");
    }

    @GetMapping
    public ResponseEntity<LinkPageProfileResponse> getLinkPageProfile(
            Authentication authentication,
            HttpServletRequest request) {
        log.info("Obtendo configurações da página de links para usuário: {}", authentication.getName());
        
        Long userId = extractUserIdFromRequest(request);
        LinkPageProfileResponse response = linkPageProfileService.getOrCreateLinkPageProfile(userId);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<LinkPageProfileResponse> updateLinkPageProfile(
            @Valid @RequestBody UpdateLinkPageProfileRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        log.info("Atualizando configurações da página de links para usuário: {}", authentication.getName());
        
        Long userId = extractUserIdFromRequest(httpRequest);
        LinkPageProfileResponse response = linkPageProfileService.updateLinkPageProfile(userId, request);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/copy-site-colors")
    public ResponseEntity<Void> copySiteColors(
            Authentication authentication,
            HttpServletRequest request) {
        log.info("Copiando cores do site para página de links do usuário: {}", authentication.getName());
        
        Long userId = extractUserIdFromRequest(request);
        linkPageProfileService.copyColorsFromSite(userId);
        
        return ResponseEntity.ok().build();
    }
}
