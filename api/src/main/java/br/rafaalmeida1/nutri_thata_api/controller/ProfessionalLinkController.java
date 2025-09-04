package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.link.CreateLinkRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.link.ReorderLinksRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.link.UpdateLinkRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.link.LinkResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.service.ProfessionalLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professional/links")
@RequiredArgsConstructor
public class ProfessionalLinkController {

    private final ProfessionalLinkService linkService;

    @GetMapping
    public ResponseEntity<List<LinkResponse>> getAllLinks(@AuthenticationPrincipal User user) {
        List<LinkResponse> links = linkService.getAllLinks(user);
        return ResponseEntity.ok(links);
    }

    @PostMapping
    public ResponseEntity<LinkResponse> createLink(
            @Valid @RequestBody CreateLinkRequest request,
            @AuthenticationPrincipal User user) {
        LinkResponse link = linkService.createLink(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(link);
    }

    @PutMapping("/{linkId}")
    public ResponseEntity<LinkResponse> updateLink(
            @PathVariable Long linkId,
            @Valid @RequestBody UpdateLinkRequest request,
            @AuthenticationPrincipal User user) {
        LinkResponse link = linkService.updateLink(linkId, request, user);
        return ResponseEntity.ok(link);
    }

    @DeleteMapping("/{linkId}")
    public ResponseEntity<Void> deleteLink(
            @PathVariable Long linkId,
            @AuthenticationPrincipal User user) {
        linkService.deleteLink(linkId, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderLinks(
            @Valid @RequestBody ReorderLinksRequest request,
            @AuthenticationPrincipal User user) {
        linkService.reorderLinks(request, user);
        return ResponseEntity.ok().build();
    }
}
