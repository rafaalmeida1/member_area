package br.rafaalmeida1.nutri_thata_api.mapper;

import br.rafaalmeida1.nutri_thata_api.dto.response.module.ModuleResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.module.ModuleSummaryResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ContentBlock;
import br.rafaalmeida1.nutri_thata_api.entities.Module;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ModuleMapper {

    @Mapping(source = "createdBy.id", target = "createdBy.id")
    @Mapping(source = "createdBy.name", target = "createdBy.name")
    ModuleResponse toModuleResponse(Module module);

    @Mapping(source = "createdBy.id", target = "createdBy.id")
    @Mapping(source = "createdBy.name", target = "createdBy.name")
    @Mapping(expression = "java(module.getContent() != null ? module.getContent().size() : 0)", target = "contentCount")
    ModuleSummaryResponse toModuleSummaryResponse(Module module);

    @Mapping(source = "orderIndex", target = "order")
    ModuleResponse.ContentBlockResponse toContentBlockResponse(ContentBlock contentBlock);
}