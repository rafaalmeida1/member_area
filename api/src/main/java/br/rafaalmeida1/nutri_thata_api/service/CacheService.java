package br.rafaalmeida1.nutri_thata_api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final CacheManager cacheManager;

    /**
     * Invalida um cache específico
     */
    public void evictCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.info("Cache '{}' invalidado com sucesso", cacheName);
        } else {
            log.warn("Cache '{}' não encontrado", cacheName);
        }
    }

    /**
     * Invalida um item específico de um cache
     */
    public void evictCacheItem(String cacheName, Object key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
            log.info("Item '{}' do cache '{}' invalidado com sucesso", key, cacheName);
        } else {
            log.warn("Cache '{}' não encontrado", cacheName);
        }
    }

    /**
     * Invalida múltiplos caches
     */
    public void evictMultipleCaches(String... cacheNames) {
        for (String cacheName : cacheNames) {
            evictCache(cacheName);
        }
    }

    /**
     * Invalida todos os caches
     */
    public void evictAllCaches() {
        Collection<String> cacheNames = cacheManager.getCacheNames();
        for (String cacheName : cacheNames) {
            evictCache(cacheName);
        }
        log.info("Todos os caches foram invalidados");
    }

    /**
     * Adiciona um item ao cache com TTL personalizado
     */
    public void putCacheItem(String cacheName, Object key, Object value) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.put(key, value);
            log.debug("Item '{}' adicionado ao cache '{}'", key, cacheName);
        } else {
            log.warn("Cache '{}' não encontrado", cacheName);
        }
    }

    /**
     * Obtém um item do cache
     */
    public Object getCacheItem(String cacheName, Object key) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            Cache.ValueWrapper value = cache.get(key);
            if (value != null) {
                log.debug("Item '{}' encontrado no cache '{}'", key, cacheName);
                return value.get();
            }
        }
        log.debug("Item '{}' não encontrado no cache '{}'", key, cacheName);
        return null;
    }

    /**
     * Verifica se um item existe no cache
     */
    public boolean hasCacheItem(String cacheName, Object key) {
        Cache cache = cacheManager.getCache(cacheName);
        return cache != null && cache.get(key) != null;
    }

    /**
     * Lista todos os caches disponíveis
     */
    public Collection<String> getCacheNames() {
        return cacheManager.getCacheNames();
    }

    /**
     * Obtém estatísticas do cache (se disponível)
     */
    public void logCacheStats() {
        Collection<String> cacheNames = cacheManager.getCacheNames();
        log.info("Caches disponíveis: {}", cacheNames);
        
        for (String cacheName : cacheNames) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                log.info("Cache '{}': {}", cacheName, cache.getNativeCache().getClass().getSimpleName());
            }
        }
    }
} 