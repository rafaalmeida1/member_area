package br.rafaalmeida1.nutri_thata_api.exception;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(BusinessException ex) {
        log.error("Erro de negócio: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(BadCredentialsException ex) {
        log.error("Credenciais inválidas: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Credenciais inválidas"));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(AuthenticationException ex) {
        log.error("Erro de autenticação: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Erro de autenticação"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException ex) {
        log.error("Acesso negado: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Acesso negado"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        log.error("Erro de validação: {}", errors);
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Object>builder()
                        .status("error")
                        .message("Dados de entrada inválidos")
                        .data(errors)
                        .build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        log.error("Arquivo muito grande: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Arquivo muito grande"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        log.error("Erro na leitura da mensagem HTTP: {}", ex.getMessage());
        log.error("Causa: {}", ex.getCause());
        log.error("Stack trace: ", ex);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Dados de entrada inválidos"));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Object> handleAllExceptions(
            Exception ex, WebRequest request) {
        
        log.error("Erro interno do servidor: ", ex);
        log.error("Request URI: {}", request.getDescription(false));
        log.error("Exception type: {}", ex.getClass().getSimpleName());
        log.error("Exception message: {}", ex.getMessage());
        if (ex.getCause() != null) {
            log.error("Cause: {}", ex.getCause().getMessage());
        }
        
        String message = "Erro interno do servidor";
        ApiResponse<Object> response = isDevelopmentEnvironment()
                ? ApiResponse.error(message, getStackTrace(ex))
                : ApiResponse.error(message);
                
        return response;
    }

    private boolean isDevelopmentEnvironment() {
        return "dev".equals(activeProfile) || "local".equals(activeProfile);
    }

    private String getStackTrace(Exception ex) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        ex.printStackTrace(pw);
        return sw.toString();
    }
}