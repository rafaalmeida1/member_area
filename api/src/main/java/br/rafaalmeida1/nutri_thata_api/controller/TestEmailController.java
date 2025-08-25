package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestEmailController {

    private final EmailService emailService;

    @PostMapping("/email/invite")
    public ResponseEntity<String> testInviteEmail(@RequestParam String email, @RequestParam String name) {
        try {
            emailService.sendInviteEmail(email, "test-token-123", "Teste Inviter", name);
            return ResponseEntity.ok("Email de convite enviado com sucesso para: " + email);
        } catch (Exception e) {
            log.error("Erro ao enviar email de teste", e);
            return ResponseEntity.internalServerError().body("Erro ao enviar email: " + e.getMessage());
        }
    }

    @PostMapping("/email/reset")
    public ResponseEntity<String> testResetEmail(@RequestParam String email, @RequestParam String name) {
        try {
            emailService.sendPasswordResetEmail(email, name, "http://localhost:5173/reset?token=test-token-123");
            return ResponseEntity.ok("Email de reset enviado com sucesso para: " + email);
        } catch (Exception e) {
            log.error("Erro ao enviar email de teste", e);
            return ResponseEntity.internalServerError().body("Erro ao enviar email: " + e.getMessage());
        }
    }

    @PostMapping("/email/welcome")
    public ResponseEntity<String> testWelcomeEmail(@RequestParam String email, @RequestParam String name) {
        try {
            emailService.sendWelcomeEmail(email, name);
            return ResponseEntity.ok("Email de boas-vindas enviado com sucesso para: " + email);
        } catch (Exception e) {
            log.error("Erro ao enviar email de teste", e);
            return ResponseEntity.internalServerError().body("Erro ao enviar email: " + e.getMessage());
        }
    }
} 