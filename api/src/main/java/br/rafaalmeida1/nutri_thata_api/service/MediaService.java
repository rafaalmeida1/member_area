package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.media.MediaLinkRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.media.MediaAssetResponse;
import br.rafaalmeida1.nutri_thata_api.entities.MediaAsset;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.MediaType;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.enums.StorageType;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.exception.NotFoundException;
import br.rafaalmeida1.nutri_thata_api.mapper.MediaAssetMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.MediaAssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {

    private final MediaAssetRepository mediaAssetRepository;
    private final MediaAssetMapper mediaAssetMapper;

    @Value("${UPLOAD_DIRECTORY}")
    private String uploadDirectory;

    @Value("${FRONTEND_URL}")
    private String baseUrl;

    @Value("${UPLOAD_MAX_FILE_SIZE}")
    private String maxFileSize;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    
    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
            "video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"
    );
    
    private static final List<String> ALLOWED_AUDIO_TYPES = Arrays.asList(
            "audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/mpeg"
    );

    @Transactional
    public MediaAssetResponse uploadFile(MultipartFile file, MediaType type, User user) {

        validateFile(file, type);

        try {
            // Create upload directory structure
            String datePath = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
            Path uploadPath = Paths.get(uploadDirectory, datePath);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadPath.resolve(uniqueFilename);
            
            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Generate public URL
            String relativePath = datePath + "/" + uniqueFilename;
            String publicUrl = baseUrl + "/static/" + relativePath;

            // Save to database
            MediaAsset mediaAsset = MediaAsset.builder()
                    .ownerUser(user)
                    .type(type)
                    .storage(StorageType.LOCAL)
                    .filePath(relativePath)
                    .publicUrl(publicUrl)
                    .originalFilename(originalFilename)
                    .fileSize(file.getSize())
                    .mimeType(file.getContentType())
                    .build();

            mediaAsset = mediaAssetRepository.save(mediaAsset);

            return mediaAssetMapper.toMediaAssetResponse(mediaAsset);

        } catch (IOException e) {
            throw new BusinessException("Erro ao fazer upload do arquivo: " + e.getMessage());
        }
    }

    @Transactional
    public MediaAssetResponse linkExternalMedia(MediaLinkRequest request, User user) {

        validateExternalUrl(request.getUrl());

        MediaAsset mediaAsset = MediaAsset.builder()
                .ownerUser(user)
                .type(request.getType())
                .storage(StorageType.EXTERNAL_URL)
                .externalUrl(request.getUrl())
                .build();

        mediaAsset = mediaAssetRepository.save(mediaAsset);

        return mediaAssetMapper.toMediaAssetResponse(mediaAsset);
    }

    public Page<MediaAssetResponse> getUserMedia(User user, MediaType type, Pageable pageable) {

        Page<MediaAsset> mediaAssets;
        if (type != null) {
            mediaAssets = mediaAssetRepository.findByOwnerUserAndType(user, type, pageable);
        } else {
            mediaAssets = mediaAssetRepository.findByOwnerUser(user, pageable);
        }

        return mediaAssets.map(mediaAssetMapper::toMediaAssetResponse);
    }

    @Transactional
    public void deleteMedia(UUID mediaId, User user) {

        MediaAsset mediaAsset = mediaAssetRepository.findById(mediaId)
                .orElseThrow(() -> new NotFoundException("Mídia não encontrada"));

        // Check permissions: owner or admin
        if (!user.getRole().equals(Role.PROFESSIONAL) && !mediaAsset.getOwnerUser().getId().equals(user.getId())) {
            throw new BusinessException("Apenas o proprietário ou administradores podem excluir esta mídia");
        }

        // Delete physical file if it's local storage
        if (mediaAsset.getStorage() == StorageType.LOCAL && mediaAsset.getFilePath() != null) {
            try {
                Path filePath = Paths.get(uploadDirectory, mediaAsset.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
            }
        }

        mediaAssetRepository.delete(mediaAsset);

    }

    private void validateFile(MultipartFile file, MediaType type) {
        if (file.isEmpty()) {
            throw new BusinessException("Arquivo não pode estar vazio");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BusinessException("Tipo de arquivo não identificado");
        }

        switch (type) {
            case IMAGE:
                if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
                    throw new BusinessException("Tipo de imagem não suportado. Tipos permitidos: " + ALLOWED_IMAGE_TYPES);
                }
                break;
            case VIDEO:
                if (!ALLOWED_VIDEO_TYPES.contains(contentType)) {
                    throw new BusinessException("Tipo de vídeo não suportado. Tipos permitidos: " + ALLOWED_VIDEO_TYPES);
                }
                break;
            case AUDIO:
                if (!ALLOWED_AUDIO_TYPES.contains(contentType)) {
                    throw new BusinessException("Tipo de áudio não suportado. Tipos permitidos: " + ALLOWED_AUDIO_TYPES);
                }
                break;
        }

        // Additional file size validation (Spring Boot already handles this, but good to double-check)
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new BusinessException("Arquivo muito grande. Tamanho máximo: 10MB");
        }
    }

    private void validateExternalUrl(String url) {
        try {
            URL urlObj = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) urlObj.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            int responseCode = connection.getResponseCode();
            if (responseCode != 200) {
                throw new BusinessException("URL externa não está acessível");
            }
        } catch (Exception e) {
            throw new BusinessException("URL externa inválida ou inacessível");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}