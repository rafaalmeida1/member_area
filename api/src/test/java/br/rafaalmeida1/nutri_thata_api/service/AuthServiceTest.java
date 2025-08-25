package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.auth.LoginRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.auth.PatientRegisterRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.auth.AuthResponse;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.exception.BusinessException;
import br.rafaalmeida1.nutri_thata_api.mapper.UserMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.ProfessionalProfileRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfessionalProfileRepository professionalProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private PatientRegisterRequest patientRegisterRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        patientRegisterRequest = PatientRegisterRequest.builder()
                .name("João Silva")
                .email("joao@email.com")
                .password("MinhaSenh@123")
                .phone("(11) 99999-9999")
                .birthDate(LocalDate.of(1990, 1, 1))
                .build();

        loginRequest = LoginRequest.builder()
                .email("joao@email.com")
                .password("MinhaSenh@123")
                .build();

        user = User.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@email.com")
                .password("encoded_password")
                .role(Role.PATIENT)
                .isActive(true)
                .build();
    }

    @Test
    void registerPatient_Success() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt_token");
        when(userMapper.toUserResponse(any(User.class))).thenReturn(null);

        // When
        AuthResponse response = authService.registerPatient(patientRegisterRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwt_token", response.getToken());
        verify(userRepository).existsByEmail("joao@email.com");
        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(any(User.class));
    }

    @Test
    void registerPatient_EmailAlreadyExists() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> authService.registerPatient(patientRegisterRequest));
        
        assertEquals("Este email já está em uso", exception.getMessage());
        verify(userRepository).existsByEmail("joao@email.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt_token");
        when(userMapper.toUserResponse(any(User.class))).thenReturn(null);

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwt_token", response.getToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("joao@email.com");
        verify(jwtService).generateToken(user);
    }

    @Test
    void login_UserNotFound() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> authService.login(loginRequest));
        
        assertEquals("Usuário não encontrado", exception.getMessage());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("joao@email.com");
    }

    @Test
    void login_UserInactive() {
        // Given
        user.setIsActive(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        // When & Then
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> authService.login(loginRequest));
        
        assertEquals("Conta desativada", exception.getMessage());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByEmail("joao@email.com");
    }
}