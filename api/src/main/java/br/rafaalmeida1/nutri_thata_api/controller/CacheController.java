package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import br.rafaalmeida1.nutri_thata_api.service.CacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
public class CacheController {

    private final CacheService cacheService;

    @PreAuthorize("hasRole('PROFESSIONAL')")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCacheStats() {
        Collection<String> cacheNames = cacheService.getCacheNames();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCaches", cacheNames.size());
        stats.put("cacheNames", cacheNames);
        
        return ResponseEntity.ok(ApiResponse.success("Estatísticas do cache", stats));
    }

    @PreAuthorize("hasRole('PROFESSIONAL')")
    @DeleteMapping("/{cacheName}")
    public ResponseEntity<ApiResponse<String>> evictCache(@PathVariable String cacheName) {
        cacheService.evictCache(cacheName);
        return ResponseEntity.ok(ApiResponse.success("Cache '" + cacheName + "' invalidado com sucesso", null));
    }

    @PreAuthorize("hasRole('PROFESSIONAL')")
    @DeleteMapping("/{cacheName}/{key}")
    public ResponseEntity<ApiResponse<String>> evictCacheItem(
            @PathVariable String cacheName, 
            @PathVariable String key) {
        cacheService.evictCacheItem(cacheName, key);
        return ResponseEntity.ok(ApiResponse.success("Item '" + key + "' do cache '" + cacheName + "' invalidado com sucesso", null));
    }

    @PreAuthorize("hasRole('PROFESSIONAL')")
    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<String>> evictAllCaches() {
        cacheService.evictAllCaches();
        return ResponseEntity.ok(ApiResponse.success("Todos os caches foram invalidados", null));
    }
} 