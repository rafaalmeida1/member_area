package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.media.MediaAssetResponse;
import br.rafaalmeida1.nutri_thata_api.entities.MediaAsset;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MediaAssetMapper {

    @Mapping(source = "ownerUser.id", target = "ownerUserId")
    MediaAssetResponse toMediaAssetResponse(MediaAsset mediaAsset);
}