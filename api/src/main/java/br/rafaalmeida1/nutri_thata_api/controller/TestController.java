package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<ApiResponse<String>> testEmail(@RequestParam String email) {
        try {
            log.info("=== TESTE DE EMAIL ===");
            log.info("Email de destino: {}", email);
            log.info("SMTP Host: {}", System.getenv("SMTP_HOST"));
            log.info("SMTP Port: {}", System.getenv("SMTP_PORT"));
            log.info("SMTP Username: {}", System.getenv("SMTP_USERNAME"));
            log.info("SMTP Password configurado: {}", System.getenv("SMTP_PASSWORD") != null ? "SIM" : "NÃO");
            
            // Enviar um email simples de teste
            emailService.sendPasswordResetEmail(email, "Usuário Teste", "http://localhost:3000/test");
            
            log.info("Email enviado com sucesso!");
            return ResponseEntity.ok(ApiResponse.success("Email de teste enviado com sucesso!", null));
        } catch (Exception e) {
            log.error("=== ERRO NO EMAIL ===");
            log.error("Erro detalhado: {}", e.getMessage());
            log.error("Stack trace completo:", e);
            return ResponseEntity.ok(ApiResponse.error("Erro ao enviar email: " + e.getMessage()));
        }
    }
}