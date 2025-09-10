package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.user.ChangePasswordRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.user.UpdateUserRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.user.UserResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.user.UserStatsResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.exception.NotFoundException;
import br.rafaalmeida1.nutri_thata_api.mapper.UserMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import br.rafaalmeida1.nutri_thata_api.repository.UserActivityRepository;
import br.rafaalmeida1.nutri_thata_api.repository.UserSessionRepository;
import br.rafaalmeida1.nutri_thata_api.repository.ModuleViewRepository;
import br.rafaalmeida1.nutri_thata_api.repository.UserCategoryProgressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final CacheService cacheService;
    private final UserActivityRepository userActivityRepository;
    private final UserSessionRepository userSessionRepository;
    private final ModuleViewRepository moduleViewRepository;
    private final UserCategoryProgressRepository userCategoryProgressRepository;

    public UserResponse getCurrentUser(User user) {
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateCurrentUser(User currentUser, UpdateUserRequest request) {

        if (request.getName() != null) {
            currentUser.setName(request.getName());
        }
        if (request.getPhone() != null) {
            currentUser.setPhone(request.getPhone());
        }
        if (request.getBirthDate() != null) {
            currentUser.setBirthDate(request.getBirthDate());
        }

        User updatedUser = userRepository.save(currentUser);

        return userMapper.toUserResponse(updatedUser);
    }

    @Cacheable(value = "users", key = "#id")
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Cacheable(value = "users", key = "#email")
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Cacheable(value = "users", key = "'patients'")
    public List<UserResponse> getAllPatients() {
        List<User> patients = userRepository.findByRoleAndIsActiveTrue(Role.PATIENT);
        
        return patients.stream()
                .map(user -> {
                    UserResponse.UserResponseBuilder builder = UserResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .isActive(user.getIsActive())
                            .createdAt(user.getCreatedAt());

                    // Adicionar estatísticas se disponíveis
                    try {
                        Long totalModulesViewed = moduleViewRepository.countByUser(user);
                        Long totalTimeSpent = moduleViewRepository.sumTimeSpentByUser(user);
                        Long modulesCompleted = moduleViewRepository.countCompletedByUser(user);
                        Double averageSessionTime = userSessionRepository.findAverageSessionDurationByUser(user);
                        
                        // Buscar última atividade
                        String lastActivity = "Nunca";
                        var lastActivityOpt = userActivityRepository.findLastActivityByUser(user);
                        if (lastActivityOpt != null) {
                            lastActivity = lastActivityOpt.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        }

                        // Buscar categorias favoritas
                        List<Object[]> favoriteCategoriesData = userActivityRepository.findFavoriteCategoriesByUser(user);
                        List<String> favoriteCategories = favoriteCategoriesData.stream()
                                .limit(3) // Top 3 categorias
                                .map(row -> (String) row[0])
                                .collect(Collectors.toList());

                        // Calcular progresso
                        Integer progressPercentage = 0;
                        if (totalModulesViewed > 0) {
                            progressPercentage = (int) Math.round((double) modulesCompleted / totalModulesViewed * 100);
                        }

                        builder.stats(UserResponse.PatientStats.builder()
                                .totalModulesViewed(totalModulesViewed.intValue())
                                .totalTimeSpent(totalTimeSpent != null ? totalTimeSpent.intValue() : 0)
                                .modulesCompleted(modulesCompleted.intValue())
                                .averageSessionTime(averageSessionTime != null ? averageSessionTime.intValue() : 0)
                                .lastActivity(lastActivity)
                                .favoriteCategories(favoriteCategories)
                                .progressPercentage(progressPercentage)
                                .build());
                    } catch (Exception e) {
                        log.error("Erro ao calcular estatísticas do paciente: {}", user.getId(), e);
                        // Continuar sem estatísticas em caso de erro
                    }

                    return builder.build();
                })
                .collect(Collectors.toList());
    }

    @Cacheable(value = "users", key = "'user_stats_' + #userId")
    public UserStatsResponse getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        try {
            // Buscar estatísticas reais dos repositórios
            Long totalModulesViewed = moduleViewRepository.countByUser(user);
            Long totalTimeSpent = moduleViewRepository.sumTimeSpentByUser(user);
            Long modulesCompleted = moduleViewRepository.countCompletedByUser(user);
            Double averageSessionTime = userSessionRepository.findAverageSessionDurationByUser(user);
            
            // Buscar categorias favoritas
            List<Object[]> favoriteCategoriesData = userActivityRepository.findFavoriteCategoriesByUser(user);
            List<String> favoriteCategories = favoriteCategoriesData.stream()
                    .limit(5) // Top 5 categorias
                    .map(row -> (String) row[0])
                    .collect(Collectors.toList());

            // Calcular progresso geral (baseado em módulos completados vs visualizados)
            Integer progressPercentage = 0;
            if (totalModulesViewed > 0) {
                progressPercentage = (int) Math.round((double) modulesCompleted / totalModulesViewed * 100);
            }

            // Buscar atividade semanal (últimos 7 dias)
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate = endDate.minusDays(7);
            List<Object[]> weeklyActivityData = userActivityRepository.findWeeklyActivityByUser(user, startDate, endDate);
            
            List<UserStatsResponse.WeeklyActivity> weeklyActivity = weeklyActivityData.stream()
                    .map(row -> UserStatsResponse.WeeklyActivity.builder()
                            .date(((java.sql.Date) row[0]).toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                            .modulesViewed(((Long) row[1]).intValue())
                            .timeSpent(0) // Seria necessário calcular baseado no tempo gasto por dia
                            .build())
                    .collect(Collectors.toList());

            // Buscar última atividade
            String lastActivity = "Nunca";
            var lastActivityOpt = userActivityRepository.findLastActivityByUser(user);
            if (lastActivityOpt != null) {
                lastActivity = lastActivityOpt.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            }

            return UserStatsResponse.builder()
                    .id(userId)
                    .totalModulesViewed(totalModulesViewed.intValue())
                    .totalTimeSpent(totalTimeSpent != null ? totalTimeSpent.intValue() : 0)
                    .modulesCompleted(modulesCompleted.intValue())
                    .averageSessionTime(averageSessionTime != null ? averageSessionTime.intValue() : 0)
                    .favoriteCategories(favoriteCategories)
                    .progressPercentage(progressPercentage)
                    .lastActivity(lastActivity)
                    .weeklyActivity(weeklyActivity)
                    .build();
        } catch (Exception e) {
            log.error("Erro ao calcular estatísticas do usuário: {}", userId, e);
            // Retornar estatísticas vazias em caso de erro
            return UserStatsResponse.builder()
                    .id(userId)
                    .totalModulesViewed(0)
                    .totalTimeSpent(0)
                    .modulesCompleted(0)
                    .averageSessionTime(0)
                    .favoriteCategories(new ArrayList<>())
                    .progressPercentage(0)
                    .lastActivity("Nunca")
                    .weeklyActivity(new ArrayList<>())
                    .build();
        }
    }

    @Caching(evict = {
        @CacheEvict(value = "users", key = "#id"),
        @CacheEvict(value = "users", key = "#user.email"),
        @CacheEvict(value = "users", allEntries = true)
    })
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        user = userRepository.save(user);
        
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Caching(evict = {
        @CacheEvict(value = "users", key = "#id"),
        @CacheEvict(value = "users", key = "#user.email"),
        @CacheEvict(value = "users", allEntries = true)
    })
    public void changePassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Senha atual incorreta");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Caching(evict = {
        @CacheEvict(value = "users", key = "#id"),
        @CacheEvict(value = "users", key = "#user.email"),
        @CacheEvict(value = "users", allEntries = true)
    })
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        user.setIsActive(false);
        userRepository.save(user);
    }
}