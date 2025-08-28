package br.rafaalmeida1.nutri_thata_api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
public class FileCleanupService {

    @Value("${UPLOAD_DIRECTORY}")
    private String uploadDirectory;

    public void deleteByPublicUrl(String urlOrPath) {
        if (urlOrPath == null || urlOrPath.isBlank()) {
            return;
        }

        try {
            String relativePath = extractRelativePath(urlOrPath);
            if (relativePath == null || relativePath.isBlank()) {
                return;
            }

            Path filePath = Paths.get(uploadDirectory, relativePath).normalize();
            Files.deleteIfExists(filePath);
            log.info("Arquivo deletado (se existia): {}", filePath.toAbsolutePath());
        } catch (Exception ex) {
            log.warn("Falha ao deletar arquivo para '{}': {}", urlOrPath, ex.getMessage());
        }
    }

    private String extractRelativePath(String urlOrPath) {
        String value = urlOrPath.trim();

        // Caso já seja um caminho relativo (ex: 2025/08/arquivo.jpg)
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
            // Também suportar quando começa com "/static/"
            if (value.startsWith("/static/")) {
                return value.substring("/static/".length());
            }
            return value.replaceFirst("^/+", "");
        }

        int idx = value.indexOf("/static/");
        if (idx >= 0) {
            return value.substring(idx + "/static/".length());
        }

        // Não é um arquivo local gerenciado (talvez CDN/externo)
        return null;
    }
}

