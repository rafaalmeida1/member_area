package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.ProfessionalProfileResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProfessionalMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "bio", target = "bio")
    @Mapping(source = "image", target = "image")
    @Mapping(source = "backgroundImage", target = "backgroundImage")
    @Mapping(source = "backgroundPositionX", target = "backgroundPositionX")
    @Mapping(source = "backgroundPositionY", target = "backgroundPositionY")
    @Mapping(source = "themePrimaryColor", target = "themePrimaryColor")
    @Mapping(source = "themeSecondaryColor", target = "themeSecondaryColor")
    @Mapping(source = "themeAccentColor", target = "themeAccentColor")
    @Mapping(source = "themeBackgroundColor", target = "themeBackgroundColor")
    @Mapping(source = "themeSurfaceColor", target = "themeSurfaceColor")
    @Mapping(source = "themeTextColor", target = "themeTextColor")
    @Mapping(source = "themeTextSecondaryColor", target = "themeTextSecondaryColor")

    @Mapping(source = "specialties", target = "specialties")
    @Mapping(source = "createdAt", target = "createdAt")
    @Mapping(source = "updatedAt", target = "updatedAt")
    ProfessionalProfileResponse toProfessionalProfileResponse(ProfessionalProfile professionalProfile);
}