package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.request.linkpage.UpdateLinkPageProfileRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.linkpage.LinkPageProfileResponse;
import br.rafaalmeida1.nutri_thata_api.entities.LinkPageProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LinkPageProfileMapper {

    LinkPageProfileResponse toResponse(LinkPageProfile entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "professionalProfile", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UpdateLinkPageProfileRequest request, @MappingTarget LinkPageProfile entity);
}
