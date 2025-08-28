package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.module.CreateModuleRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.module.UpdateModuleRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.module.ModuleResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.module.ModuleSummaryResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import br.rafaalmeida1.nutri_thata_api.dto.request.module.ModuleReorderRequest;

@RestController
@RequestMapping("/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ModuleResponse>>> getModules(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User user) {
        
        Page<ModuleResponse> modules = moduleService.getModules(user, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lista de módulos", modules));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories(@AuthenticationPrincipal User user) {
        List<String> categories = moduleService.getCategories(user);
        return ResponseEntity.ok(ApiResponse.success("Categorias disponíveis", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ModuleResponse>> getModuleById(
            @PathVariable String id) {
        
        ModuleResponse module = moduleService.getModuleById(id);
        return ResponseEntity.ok(ApiResponse.success("Módulo encontrado", module));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ModuleResponse>> createModule(
            @Valid @RequestBody CreateModuleRequest request,
            @AuthenticationPrincipal User user) {
        
        ModuleResponse module = moduleService.createModule(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Módulo criado com sucesso", module));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ModuleResponse>> updateModule(
            @PathVariable String id,
            @Valid @RequestBody UpdateModuleRequest request,
            @AuthenticationPrincipal User user) {
        
        ModuleResponse module = moduleService.updateModule(id, user, request);
        return ResponseEntity.ok(ApiResponse.success("Módulo atualizado com sucesso", module));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteModule(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        
        moduleService.deleteModule(id, user);
        return ResponseEntity.ok(ApiResponse.success("Módulo excluído com sucesso", null));
    }

    @PatchMapping("/reorder")
    public ResponseEntity<ApiResponse<List<ModuleResponse>>> reorderModules(
            @RequestBody List<ModuleReorderRequest> reorderRequests,
            @AuthenticationPrincipal User user) {
        
        List<ModuleResponse> reorderedModules = moduleService.reorderModules(user, reorderRequests);
        return ResponseEntity.ok(ApiResponse.success("Módulos reordenados com sucesso", reorderedModules));
    }
}