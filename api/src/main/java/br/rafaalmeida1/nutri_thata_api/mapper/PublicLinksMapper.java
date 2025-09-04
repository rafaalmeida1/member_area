package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.link.PublicLinksResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProfessionalLinkMapper.class})
public interface PublicLinksMapper {

    @Mapping(target = "professionalId", source = "id")
    @Mapping(target = "links", ignore = true)
    PublicLinksResponse toResponse(ProfessionalProfile entity);
}
