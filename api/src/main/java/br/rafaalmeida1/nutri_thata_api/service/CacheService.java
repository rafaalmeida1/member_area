package br.rafaalmeida1.nutri_thata_api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Limpa todo o cache do Redis
     */
    public void clearAllCache() {
        try {
            log.info("Iniciando limpeza completa do cache Redis");
            
            // Limpar todas as chaves do Redis
            redisTemplate.getConnectionFactory().getConnection().flushAll();
            
            log.info("Cache Redis limpo com sucesso - todas as chaves foram removidas");
        } catch (Exception e) {
            log.error("Erro ao limpar cache Redis: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao limpar cache: " + e.getMessage());
        }
    }

    /**
     * Limpa cache específico por padrão
     */
    public void clearCacheByPattern(String pattern) {
        try {
            log.info("Iniciando limpeza do cache com padrão: {}", pattern);
            
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Cache limpo com sucesso - {} chaves removidas com padrão: {}", keys.size(), pattern);
            } else {
                log.info("Nenhuma chave encontrada com o padrão: {}", pattern);
            }
        } catch (Exception e) {
            log.error("Erro ao limpar cache com padrão {}: {}", pattern, e.getMessage(), e);
            throw new RuntimeException("Erro ao limpar cache com padrão: " + e.getMessage());
        }
    }

    /**
     * Obtém informações sobre o cache
     */
    public CacheInfo getCacheInfo() {
        try {
            Set<String> allKeys = redisTemplate.keys("*");
            int totalKeys = allKeys != null ? allKeys.size() : 0;
            
            // Contar chaves por padrão
            int userKeys = redisTemplate.keys("user:*") != null ? redisTemplate.keys("user:*").size() : 0;
            int moduleKeys = redisTemplate.keys("module:*") != null ? redisTemplate.keys("module:*").size() : 0;
            int sessionKeys = redisTemplate.keys("session:*") != null ? redisTemplate.keys("session:*").size() : 0;
            int themeKeys = redisTemplate.keys("theme:*") != null ? redisTemplate.keys("theme:*").size() : 0;
            
            return CacheInfo.builder()
                    .totalKeys(totalKeys)
                    .userKeys(userKeys)
                    .moduleKeys(moduleKeys)
                    .sessionKeys(sessionKeys)
                    .themeKeys(themeKeys)
                    .build();
        } catch (Exception e) {
            log.error("Erro ao obter informações do cache: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao obter informações do cache: " + e.getMessage());
        }
    }

    /**
     * Limpa cache de usuários
     */
    public void clearUserCache() {
        clearCacheByPattern("user:*");
    }

    /**
     * Limpa cache de módulos
     */
    public void clearModuleCache() {
        clearCacheByPattern("module:*");
    }

    /**
     * Limpa cache de sessões
     */
    public void clearSessionCache() {
        clearCacheByPattern("session:*");
    }

    /**
     * Limpa cache de temas
     */
    public void clearThemeCache() {
        clearCacheByPattern("theme:*");
    }

    /**
     * Classe para informações do cache
     */
    @lombok.Builder
    @lombok.Data
    public static class CacheInfo {
        private int totalKeys;
        private int userKeys;
        private int moduleKeys;
        private int sessionKeys;
        private int themeKeys;
    }
}