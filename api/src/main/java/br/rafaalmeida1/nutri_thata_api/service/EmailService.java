package br.rafaalmeida1.nutri_thata_api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final String INVITE_TEMPLATE_NAME = "invite-email";
    private static final String PASSWORD_RESET_TEMPLATE_NAME = "password-reset-email";
    private static final String WELCOME_TEMPLATE_NAME = "welcome-email";
    private static final String INVITE_MAIL_SUBJECT = "Convite para participar da Nutri Thata";
    private static final String PASSWORD_RESET_MAIL_SUBJECT = "Redefinição de Senha - Nutri Thata";
    private static final String WELCOME_MAIL_SUBJECT = "Bem-vindo(a) à Nutri Thata";

    private final Environment environment;
    private final JavaMailSender mailSender;
    private final TemplateEngine htmlTemplateEngine;

    @Value("${FRONTEND_URL}")
    private String frontendBaseUrl;

    public void sendInviteEmail(String toEmail, String inviteToken, String inviterName, String prefillName) {
        log.info("Iniciando envio de email de convite para: {}", toEmail);
        
        String inviteUrl = frontendBaseUrl + "/invite/" + inviteToken;
        String recipientName = prefillName != null ? prefillName : "você";
        String mailFrom = environment.getProperty("spring.mail.properties.mail.smtp.from");
        String mailFromName = environment.getProperty("mail.from.name", "Nutri Thata");

        try {
            MimeMessage mimeMessage = this.mailSender.createMimeMessage();
            MimeMessageHelper email = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            email.setTo(toEmail);
            email.setSubject(INVITE_MAIL_SUBJECT);
            email.setFrom(mailFrom, mailFromName);

            Context ctx = new Context(Locale.getDefault());
            ctx.setVariable("recipientName", recipientName);
            ctx.setVariable("inviterName", inviterName);
            ctx.setVariable("inviteUrl", inviteUrl);

            String htmlContent = this.htmlTemplateEngine.process(INVITE_TEMPLATE_NAME, ctx);
            email.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Email de convite enviado com sucesso para: {}", toEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Erro ao enviar email de convite para: {}", toEmail, e);
            throw new RuntimeException("Erro ao enviar email de convite: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String toEmail, String userName, String resetUrl) {
        log.info("Iniciando envio de email de redefinição de senha para: {}", toEmail);
        
        String mailFrom = environment.getProperty("spring.mail.properties.mail.smtp.from");
        String mailFromName = environment.getProperty("mail.from.name", "Nutri Thata");

        try {
            MimeMessage mimeMessage = this.mailSender.createMimeMessage();
            MimeMessageHelper email = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            email.setTo(toEmail);
            email.setSubject(PASSWORD_RESET_MAIL_SUBJECT);
            email.setFrom(mailFrom, mailFromName);

            Context ctx = new Context(Locale.getDefault());
            ctx.setVariable("userName", userName);
            ctx.setVariable("resetUrl", resetUrl);

            String htmlContent = this.htmlTemplateEngine.process(PASSWORD_RESET_TEMPLATE_NAME, ctx);
            email.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Email de redefinição de senha enviado com sucesso para: {}", toEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Erro ao enviar email de redefinição de senha para: {}", toEmail, e);
            throw new RuntimeException("Erro ao enviar email de redefinição de senha: " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(String toEmail, String userName) {
        log.info("Iniciando envio de email de boas-vindas para: {}", toEmail);
        
        String mailFrom = environment.getProperty("spring.mail.properties.mail.smtp.from");
        String mailFromName = environment.getProperty("mail.from.name", "Nutri Thata");

        try {
            MimeMessage mimeMessage = this.mailSender.createMimeMessage();
            MimeMessageHelper email = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            email.setTo(toEmail);
            email.setSubject(WELCOME_MAIL_SUBJECT);
            email.setFrom(mailFrom, mailFromName);

            Context ctx = new Context(Locale.getDefault());
            ctx.setVariable("userName", userName);
            ctx.setVariable("frontendUrl", frontendBaseUrl);

            String htmlContent = this.htmlTemplateEngine.process(WELCOME_TEMPLATE_NAME, ctx);
            email.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Email de boas-vindas enviado com sucesso para: {}", toEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Erro ao enviar email de boas-vindas para: {}", toEmail, e);
            // Não lança exceção para email de boas-vindas, pois não é crítico
        }
    }
} 