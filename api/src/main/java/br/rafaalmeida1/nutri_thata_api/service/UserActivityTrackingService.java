package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.entities.*;
import br.rafaalmeida1.nutri_thata_api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityTrackingService {

    private final UserActivityRepository userActivityRepository;
    private final UserSessionRepository userSessionRepository;
    private final ModuleViewRepository moduleViewRepository;
    private final UserCategoryProgressRepository userCategoryProgressRepository;

    @Transactional
    public void trackPageView(User user, String pagePath, String sessionId, String userAgent, String ipAddress) {
        try {
            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .activityType("page_view")
                    .pagePath(pagePath)
                    .sessionId(sessionId)
                    .userAgent(userAgent)
                    .ipAddress(ipAddress)
                    .build();

            // Extrair informações do user agent
            extractDeviceInfo(userAgent, activity);

            userActivityRepository.save(activity);

            // Atualizar contador de páginas visitadas na sessão
            updateSessionPagesVisited(sessionId);

            log.debug("Página visualizada rastreada: usuário={}, página={}", user.getId(), pagePath);
        } catch (Exception e) {
            log.error("Erro ao rastrear visualização de página", e);
        }
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void trackModuleView(User user, Long moduleId, String moduleTitle, String category, 
                               Long timeSpent, String sessionId, String userAgent, String ipAddress) {
        try {
            // Salvar atividade
            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .activityType("module_view")
                    .moduleId(moduleId)
                    .moduleTitle(moduleTitle)
                    .category(category)
                    .timeSpent(timeSpent)
                    .sessionId(sessionId)
                    .userAgent(userAgent)
                    .ipAddress(ipAddress)
                    .build();

            extractDeviceInfo(userAgent, activity);
            userActivityRepository.save(activity);

            // Salvar visualização do módulo
            ModuleView moduleView = ModuleView.builder()
                    .user(user)
                    .moduleId(moduleId)
                    .moduleTitle(moduleTitle)
                    .category(category)
                    .timeSpent(timeSpent)
                    .sessionId(sessionId)
                    .build();

            moduleViewRepository.save(moduleView);

            // Atualizar progresso da categoria
            updateCategoryProgress(user, category, timeSpent, false);

            // Atualizar contador de módulos visualizados na sessão
            updateSessionModulesViewed(sessionId);

            log.debug("Módulo visualizado rastreado: usuário={}, módulo={}", user.getId(), moduleId);
        } catch (Exception e) {
            log.error("Erro ao rastrear visualização de módulo", e);
        }
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void trackModuleCompletion(User user, Long moduleId, String moduleTitle, String category, 
                                     Long timeSpent, Integer completionPercentage, String sessionId) {
        try {
            // Salvar atividade
            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .activityType("module_complete")
                    .moduleId(moduleId)
                    .moduleTitle(moduleTitle)
                    .category(category)
                    .timeSpent(timeSpent)
                    .sessionId(sessionId)
                    .build();

            userActivityRepository.save(activity);

            // Atualizar visualização do módulo como completado
            List<ModuleView> moduleViews = moduleViewRepository.findByUserAndModuleId(user, moduleId);
            if (!moduleViews.isEmpty()) {
                ModuleView moduleView = moduleViews.get(0);
                moduleView.setIsCompleted(true);
                moduleView.setCompletionPercentage(completionPercentage);
                moduleViewRepository.save(moduleView);
            }

            // Atualizar progresso da categoria
            updateCategoryProgress(user, category, timeSpent, true);

            // Atualizar contador de módulos completados na sessão
            updateSessionModulesCompleted(sessionId);

            log.debug("Módulo completado rastreado: usuário={}, módulo={}", user.getId(), moduleId);
        } catch (Exception e) {
            log.error("Erro ao rastrear conclusão de módulo", e);
        }
    }

    @Transactional
    public String startSession(User user, String userAgent, String ipAddress) {
        try {
            String sessionId = UUID.randomUUID().toString();

            UserSession session = UserSession.builder()
                    .user(user)
                    .sessionId(sessionId)
                    .startTime(LocalDateTime.now())
                    .userAgent(userAgent)
                    .ipAddress(ipAddress)
                    .isActive(true)
                    .build();

            extractDeviceInfo(userAgent, session);
            userSessionRepository.save(session);

            // Salvar atividade de início de sessão
            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .activityType("session_start")
                    .sessionId(sessionId)
                    .userAgent(userAgent)
                    .ipAddress(ipAddress)
                    .build();

            extractDeviceInfo(userAgent, activity);
            userActivityRepository.save(activity);

            log.debug("Sessão iniciada: usuário={}, sessão={}", user.getId(), sessionId);
            return sessionId;
        } catch (Exception e) {
            log.error("Erro ao iniciar sessão", e);
            return null;
        }
    }

    @Transactional
    public void endSession(String sessionId, Long totalTimeSpent) {
        try {
            Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(sessionId);
            if (sessionOpt.isPresent()) {
                UserSession session = sessionOpt.get();
                session.setEndTime(LocalDateTime.now());
                session.setTotalTimeSpent(totalTimeSpent);
                session.setIsActive(false);
                userSessionRepository.save(session);

                // Salvar atividade de fim de sessão
                UserActivity activity = UserActivity.builder()
                        .user(session.getUser())
                        .activityType("session_end")
                        .sessionId(sessionId)
                        .timeSpent(totalTimeSpent)
                        .build();

                userActivityRepository.save(activity);

                log.debug("Sessão finalizada: usuário={}, sessão={}, tempo={}", 
                         session.getUser().getId(), sessionId, totalTimeSpent);
            }
        } catch (Exception e) {
            log.error("Erro ao finalizar sessão", e);
        }
    }

    private void updateCategoryProgress(User user, String category, Long timeSpent, boolean isCompleted) {
        try {
            Optional<UserCategoryProgress> progressOpt = userCategoryProgressRepository
                    .findByUserAndCategory(user, category);

            UserCategoryProgress progress;
            if (progressOpt.isPresent()) {
                progress = progressOpt.get();
                progress.setModulesViewed(progress.getModulesViewed() + 1);
                progress.setTotalTimeSpent(progress.getTotalTimeSpent() + timeSpent);
                if (isCompleted) {
                    progress.setModulesCompleted(progress.getModulesCompleted() + 1);
                }
                progress.setLastActivity(LocalDateTime.now());
            } else {
                progress = UserCategoryProgress.builder()
                        .user(user)
                        .category(category)
                        .modulesViewed(1)
                        .modulesCompleted(isCompleted ? 1 : 0)
                        .totalTimeSpent(timeSpent)
                        .lastActivity(LocalDateTime.now())
                        .build();
            }

            userCategoryProgressRepository.save(progress);
        } catch (Exception e) {
            log.error("Erro ao atualizar progresso da categoria", e);
        }
    }

    private void updateSessionPagesVisited(String sessionId) {
        try {
            Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(sessionId);
            if (sessionOpt.isPresent()) {
                UserSession session = sessionOpt.get();
                session.setPagesVisited(session.getPagesVisited() + 1);
                userSessionRepository.save(session);
            }
        } catch (Exception e) {
            log.error("Erro ao atualizar páginas visitadas na sessão", e);
        }
    }

    private void updateSessionModulesViewed(String sessionId) {
        try {
            Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(sessionId);
            if (sessionOpt.isPresent()) {
                UserSession session = sessionOpt.get();
                session.setModulesViewed(session.getModulesViewed() + 1);
                userSessionRepository.save(session);
            }
        } catch (Exception e) {
            log.error("Erro ao atualizar módulos visualizados na sessão", e);
        }
    }

    private void updateSessionModulesCompleted(String sessionId) {
        try {
            Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(sessionId);
            if (sessionOpt.isPresent()) {
                UserSession session = sessionOpt.get();
                session.setModulesCompleted(session.getModulesCompleted() + 1);
                userSessionRepository.save(session);
            }
        } catch (Exception e) {
            log.error("Erro ao atualizar módulos completados na sessão", e);
        }
    }

    private void extractDeviceInfo(String userAgent, UserActivity activity) {
        if (userAgent != null) {
            // Detectar dispositivo
            if (userAgent.toLowerCase().contains("mobile") || userAgent.toLowerCase().contains("android") || userAgent.toLowerCase().contains("iphone")) {
                activity.setDeviceType("mobile");
            } else if (userAgent.toLowerCase().contains("tablet") || userAgent.toLowerCase().contains("ipad")) {
                activity.setDeviceType("tablet");
            } else {
                activity.setDeviceType("desktop");
            }

            // Detectar navegador
            if (userAgent.toLowerCase().contains("chrome")) {
                activity.setBrowser("Chrome");
            } else if (userAgent.toLowerCase().contains("firefox")) {
                activity.setBrowser("Firefox");
            } else if (userAgent.toLowerCase().contains("safari")) {
                activity.setBrowser("Safari");
            } else if (userAgent.toLowerCase().contains("edge")) {
                activity.setBrowser("Edge");
            } else {
                activity.setBrowser("Other");
            }

            // Detectar sistema operacional
            if (userAgent.toLowerCase().contains("windows")) {
                activity.setOperatingSystem("Windows");
            } else if (userAgent.toLowerCase().contains("mac")) {
                activity.setOperatingSystem("macOS");
            } else if (userAgent.toLowerCase().contains("linux")) {
                activity.setOperatingSystem("Linux");
            } else if (userAgent.toLowerCase().contains("android")) {
                activity.setOperatingSystem("Android");
            } else if (userAgent.toLowerCase().contains("ios")) {
                activity.setOperatingSystem("iOS");
            } else {
                activity.setOperatingSystem("Other");
            }
        }
    }

    private void extractDeviceInfo(String userAgent, UserSession session) {
        if (userAgent != null) {
            // Detectar dispositivo
            if (userAgent.toLowerCase().contains("mobile") || userAgent.toLowerCase().contains("android") || userAgent.toLowerCase().contains("iphone")) {
                session.setDeviceType("mobile");
            } else if (userAgent.toLowerCase().contains("tablet") || userAgent.toLowerCase().contains("ipad")) {
                session.setDeviceType("tablet");
            } else {
                session.setDeviceType("desktop");
            }

            // Detectar navegador
            if (userAgent.toLowerCase().contains("chrome")) {
                session.setBrowser("Chrome");
            } else if (userAgent.toLowerCase().contains("firefox")) {
                session.setBrowser("Firefox");
            } else if (userAgent.toLowerCase().contains("safari")) {
                session.setBrowser("Safari");
            } else if (userAgent.toLowerCase().contains("edge")) {
                session.setBrowser("Edge");
            } else {
                session.setBrowser("Other");
            }

            // Detectar sistema operacional
            if (userAgent.toLowerCase().contains("windows")) {
                session.setOperatingSystem("Windows");
            } else if (userAgent.toLowerCase().contains("mac")) {
                session.setOperatingSystem("macOS");
            } else if (userAgent.toLowerCase().contains("linux")) {
                session.setOperatingSystem("Linux");
            } else if (userAgent.toLowerCase().contains("android")) {
                session.setOperatingSystem("Android");
            } else if (userAgent.toLowerCase().contains("ios")) {
                session.setOperatingSystem("iOS");
            } else {
                session.setOperatingSystem("Other");
            }
        }
    }
}
