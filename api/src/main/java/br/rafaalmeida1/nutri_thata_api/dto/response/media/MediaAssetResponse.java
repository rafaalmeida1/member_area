package br.rafaalmeida1.nutri_thata_api.dto.response.media;

import br.rafaalmeida1.nutri_thata_api.enums.MediaType;
import br.rafaalmeida1.nutri_thata_api.enums.StorageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaAssetResponse {

    private UUID id;
    private Long ownerUserId;
    private MediaType type;
    private StorageType storage;
    private String filePath;
    private String publicUrl;
    private String externalUrl;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;
    private LocalDateTime createdAt;
}