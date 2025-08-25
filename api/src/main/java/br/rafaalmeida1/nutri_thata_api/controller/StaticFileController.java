package br.rafaalmeida1.nutri_thata_api.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/static")
@Slf4j
public class StaticFileController {

    @Value("${nutri.upload.directory:uploads}")
    private String uploadDirectory;

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        try {
            // Extrair o path da requisição
            String path = request.getRequestURI().substring("/static/".length());
            
            // Remove qualquer prefixo "/static/" do path se presente
            String cleanPath = path.startsWith("/static/") ? path.substring(8) : path;
            
            // Constrói o caminho completo para o arquivo
            Path filePath = Paths.get(uploadDirectory).resolve(cleanPath).normalize();
            
            log.debug("Tentando servir arquivo: {}", filePath.toAbsolutePath());
            
            Resource resource = new FileSystemResource(filePath);
            
            if (!resource.exists() || !resource.isReadable()) {
                log.warn("Arquivo não encontrado ou não legível: {}", filePath);
                return ResponseEntity.notFound().build();
            }

            // Detecta o tipo de conteúdo
            String contentType;
            try {
                contentType = Files.probeContentType(filePath);
            } catch (IOException ex) {
                contentType = "application/octet-stream";
            }
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(resource);

        } catch (Exception e) {
            log.error("Erro ao servir arquivo estático: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
}