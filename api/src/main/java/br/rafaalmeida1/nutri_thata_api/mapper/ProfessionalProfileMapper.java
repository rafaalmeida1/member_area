package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.professional.ProfessionalProfileResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProfessionalProfileMapper {

    @Mapping(source = "user.id", target = "userId")
    ProfessionalProfileResponse toProfessionalProfileResponse(ProfessionalProfile professionalProfile);
}