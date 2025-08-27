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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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

    public UserResponse getUserById(Long userId, User currentUser) {

        // Check permissions: user can only see their own profile unless professional
        if (!currentUser.getRole().equals(Role.PROFESSIONAL) && !currentUser.getId().equals(userId)) {
            throw new BusinessException("Acesso negado para visualizar este usuário");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request, User currentUser) {

        // Only professional can update other users
        if (!currentUser.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais podem atualizar outros usuários");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getBirthDate() != null) {
            user.setBirthDate(request.getBirthDate());
        }

        User updatedUser = userRepository.save(user);

        return userMapper.toUserResponse(updatedUser);
    }

    @Transactional
    public void deleteUser(Long userId, User currentUser) {

        // Only professional can delete users
        if (!currentUser.getRole().equals(Role.PROFESSIONAL)) {
            throw new BusinessException("Apenas profissionais podem excluir usuários");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        // Prevent professional from deleting themselves
        if (user.getId().equals(currentUser.getId())) {
            throw new BusinessException("Não é possível excluir sua própria conta");
        }

        // Soft delete by deactivating
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Senha atual incorreta");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserResponse> getPatientsList() {
        List<User> patients = userRepository.findByRoleAndIsActiveTrue(Role.PATIENT);
        return userMapper.toUserResponseList(patients);
    }

    public List<UserResponse> getPatientsWithStats() {
        List<User> patients = userRepository.findByRoleAndIsActiveTrue(Role.PATIENT);
        // TODO: Implementar lógica para adicionar estatísticas aos pacientes
        return userMapper.toUserResponseList(patients);
    }

    public UserStatsResponse getUserStats(User user) {
        // TODO: Implementar lógica para buscar estatísticas do usuário
        return UserStatsResponse.builder()
                .id(user.getId())
                .totalModulesViewed(0)
                .totalTimeSpent(0)
                .lastActivity("2024-01-01T00:00:00")
                .modulesCompleted(0)
                .averageSessionTime(0)
                .favoriteCategories(List.of())
                .progressPercentage(0)
                .weeklyActivity(List.of())
                .build();
    }
}