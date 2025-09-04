package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.request.link.CreateLinkRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.link.UpdateLinkRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.link.LinkResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.link.PublicLinkResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalLink;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProfessionalLinkMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "professionalProfile", ignore = true)
    @Mapping(target = "clickCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProfessionalLink toEntity(CreateLinkRequest request);

    LinkResponse toResponse(ProfessionalLink entity);

    PublicLinkResponse toPublicResponse(ProfessionalLink entity);

    List<LinkResponse> toResponseList(List<ProfessionalLink> entities);

    List<PublicLinkResponse> toPublicResponseList(List<ProfessionalLink> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "professionalProfile", ignore = true)
    @Mapping(target = "clickCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UpdateLinkRequest request, @MappingTarget ProfessionalLink entity);
}
