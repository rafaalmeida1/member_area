package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.entities.PasswordResetToken;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.exception.NotFoundException;
import br.rafaalmeida1.nutri_thata_api.repositories.PasswordResetTokenRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PasswordResetService {
    
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${frontend_url}")
    private String frontendUrl;
    
    @Transactional
    public void sendPasswordResetEmail(String email) {
        log.info("Solicitação de reset de senha para email: {}", email);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NotFoundException("Usuário não encontrado com o email: " + email));
        
        // Invalidar tokens anteriores
        passwordResetTokenRepository.invalidateAllUserTokens(user);
        
        // Criar novo token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(2)); // Expira em 2 horas
        resetToken.setUsed(false);
        
        passwordResetTokenRepository.save(resetToken);
        
        // Enviar email
        String resetUrl = frontendUrl + "/reset-password/" + token;
        
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetUrl);
            log.info("Email de reset de senha enviado para: {}", email);
        } catch (Exception e) {
            log.error("Erro ao enviar email de reset de senha para: {}", email, e);
            throw new BusinessException("Erro ao enviar email de redefinição de senha");
        }
    }
    
    @Transactional(readOnly = true)
    public void validateResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(token)
            .orElseThrow(() -> new BusinessException("Token de redefinição inválido ou expirado"));
        
        if (!resetToken.isValid()) {
            throw new BusinessException("Token de redefinição inválido ou expirado");
        }
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Redefinindo senha com token: {}", token);
        
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(token)
            .orElseThrow(() -> new BusinessException("Token de redefinição inválido ou expirado"));
        
        if (!resetToken.isValid()) {
            throw new BusinessException("Token de redefinição inválido ou expirado");
        }
        
        User user = resetToken.getUser();
        
        // Atualizar senha
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Marcar token como usado
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        
        log.info("Senha redefinida com sucesso para usuário: {}", user.getEmail());
    }
    
    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Tokens expirados removidos do banco de dados");
    }
}