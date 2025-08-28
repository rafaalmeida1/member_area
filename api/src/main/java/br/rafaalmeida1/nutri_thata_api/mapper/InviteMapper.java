package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.invite.InvitePreviewResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.invite.InviteResponse;
import br.rafaalmeida1.nutri_thata_api.entities.Invite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Value;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class InviteMapper {

    @Value("${FRONTEND_URL}")
    private String frontendBaseUrl;

    @Mapping(source = "createdBy.id", target = "createdBy.id")
    @Mapping(source = "createdBy.name", target = "createdBy.name")
    @Mapping(expression = "java(buildFullLink(invite))", target = "fullLink")
    public abstract InviteResponse toInviteResponse(Invite invite);

    @Mapping(expression = "java(invite.isValid())", target = "isValid")
    @Mapping(source = "createdBy.id", target = "createdBy.id")
    @Mapping(source = "createdBy.name", target = "createdBy.name")
    @Mapping(expression = "java(invite.getPrefill() != null ? (String) invite.getPrefill().get(\"name\") : null)", target = "name")
    @Mapping(expression = "java(invite.getPrefill() != null ? (String) invite.getPrefill().get(\"phone\") : null)", target = "phone")
    public abstract InvitePreviewResponse toInvitePreviewResponse(Invite invite);

    protected String buildFullLink(Invite invite) {
        return frontendBaseUrl + "/invite/" + invite.getToken();
    }
}