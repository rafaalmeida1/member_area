package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.link.PublicLinksResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.linkpage.LinkPageProfileResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProfessionalLinkMapper.class})
public interface PublicLinksMapper {

    @Mapping(target = "professionalId", source = "profile.id")
    @Mapping(target = "name", expression = "java(getDisplayName(profile, linkPageProfile))")
    @Mapping(target = "title", expression = "java(getDisplayTitle(profile, linkPageProfile))")
    @Mapping(target = "bio", expression = "java(getDisplayBio(profile, linkPageProfile))")
    @Mapping(target = "image", expression = "java(getDisplayImage(profile, linkPageProfile))")
    @Mapping(target = "backgroundImage", expression = "java(getBackgroundImage(profile, linkPageProfile))")
    @Mapping(target = "backgroundPositionX", expression = "java(getBackgroundPositionX(profile, linkPageProfile))")
    @Mapping(target = "backgroundPositionY", expression = "java(getBackgroundPositionY(profile, linkPageProfile))")
    @Mapping(target = "themePrimaryColor", expression = "java(getThemePrimaryColor(profile, linkPageProfile))")
    @Mapping(target = "themeSecondaryColor", expression = "java(getThemeSecondaryColor(profile, linkPageProfile))")
    @Mapping(target = "themeBackgroundColor", expression = "java(getThemeBackgroundColor(profile, linkPageProfile))")
    @Mapping(target = "themeSurfaceColor", expression = "java(getThemeSurfaceColor(profile, linkPageProfile))")
    @Mapping(target = "themeTextPrimaryColor", expression = "java(getThemeTextPrimaryColor(profile, linkPageProfile))")
    @Mapping(target = "themeTextSecondaryColor", expression = "java(getThemeTextSecondaryColor(profile, linkPageProfile))")
    @Mapping(target = "themeBorderColor", expression = "java(getThemeBorderColor(profile, linkPageProfile))")
    @Mapping(target = "themeHoverColor", expression = "java(getThemeHoverColor(profile, linkPageProfile))")
    @Mapping(target = "links", ignore = true)
    PublicLinksResponse toResponse(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile);

    // Métodos auxiliares para determinar qual valor usar (personalizado ou padrão)
    default String getDisplayName(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getDisplayName() != null 
            ? linkPageProfile.getDisplayName() 
            : profile.getName();
    }

    default String getDisplayTitle(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getDisplayTitle() != null 
            ? linkPageProfile.getDisplayTitle() 
            : profile.getTitle();
    }

    default String getDisplayBio(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getDisplayBio() != null 
            ? linkPageProfile.getDisplayBio() 
            : profile.getBio();
    }

    default String getDisplayImage(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getDisplayImageUrl() != null 
            ? linkPageProfile.getDisplayImageUrl() 
            : profile.getImage();
    }

    default String getBackgroundImage(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getBackgroundImageUrl() != null 
            ? linkPageProfile.getBackgroundImageUrl() 
            : profile.getBackgroundImage();
    }

    default Integer getBackgroundPositionX(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getBackgroundPositionX() != null 
            ? linkPageProfile.getBackgroundPositionX() 
            : profile.getBackgroundPositionX();
    }

    default Integer getBackgroundPositionY(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getBackgroundPositionY() != null 
            ? linkPageProfile.getBackgroundPositionY() 
            : profile.getBackgroundPositionY();
    }

    // Métodos para cores (usa personalizada se existir, senão usa do perfil)
    default String getThemePrimaryColor(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getPagePrimaryColor() != null 
            ? linkPageProfile.getPagePrimaryColor() 
            : profile.getThemePrimaryColor();
    }

    default String getThemeSecondaryColor(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getPageSecondaryColor() != null 
            ? linkPageProfile.getPageSecondaryColor() 
            : profile.getThemeSecondaryColor();
    }

    default String getThemeBackgroundColor(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getPageBackgroundColor() != null 
            ? linkPageProfile.getPageBackgroundColor() 
            : profile.getThemeBackgroundColor();
    }

    default String getThemeSurfaceColor(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getPageSurfaceColor() != null 
            ? linkPageProfile.getPageSurfaceColor() 
            : profile.getThemeSurfaceColor();
    }

    default String getThemeTextPrimaryColor(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getPageTextPrimaryColor() != null 
            ? linkPageProfile.getPageTextPrimaryColor() 
            : profile.getThemeTextPrimaryColor();
    }

    default String getThemeTextSecondaryColor(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getPageTextSecondaryColor() != null 
            ? linkPageProfile.getPageTextSecondaryColor() 
            : profile.getThemeTextSecondaryColor();
    }

    default String getThemeBorderColor(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getPageBorderColor() != null 
            ? linkPageProfile.getPageBorderColor() 
            : profile.getThemeBorderColor();
    }

    default String getThemeHoverColor(ProfessionalProfile profile, LinkPageProfileResponse linkPageProfile) {
        return linkPageProfile != null && linkPageProfile.getPageHoverColor() != null 
            ? linkPageProfile.getPageHoverColor() 
            : profile.getThemeHoverColor();
    }
}
