package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.media.MediaLinkRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.media.MediaAssetResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.MediaType;
import br.rafaalmeida1.nutri_thata_api.service.MediaService;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<MediaAssetResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) MediaType type,
            @AuthenticationPrincipal User user) {
        
        try {
            // Auto-detect media type if not provided
        if (type == null) {
            String contentType = file.getContentType();
            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    type = MediaType.IMAGE;
                } else if (contentType.startsWith("video/")) {
                    type = MediaType.VIDEO;
                } else if (contentType.startsWith("audio/")) {
                    type = MediaType.AUDIO;
                } else {
                    type = MediaType.IMAGE; // default
                }
            } else {
                type = MediaType.IMAGE; // default
            }
        }
        
        MediaAssetResponse response = mediaService.uploadFile(file, type, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Upload concluído", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Erro ao processar o upload", e.getMessage()));
        }
    }

    @PostMapping("/link")
    public ResponseEntity<ApiResponse<MediaAssetResponse>> linkExternalMedia(
            @Valid @RequestBody MediaLinkRequest request,
            @AuthenticationPrincipal User user) {
        
        MediaAssetResponse response = mediaService.linkExternalMedia(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("URL validada e salva", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<MediaAssetResponse>>> getUserMedia(
            @RequestParam(required = false) MediaType type,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User user) {
        
        Page<MediaAssetResponse> media = mediaService.getUserMedia(user, type, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lista de mídias", media));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        
        mediaService.deleteMedia(id, user);
        return ResponseEntity.ok(ApiResponse.success("Mídia removida com sucesso", null));
    }
}