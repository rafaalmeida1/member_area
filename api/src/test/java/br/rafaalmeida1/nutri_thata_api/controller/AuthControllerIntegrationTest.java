package br.rafaalmeida1.nutri_thata_api.controller;

import br.rafaalmeida1.nutri_thata_api.dto.request.auth.LoginRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.auth.PatientRegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerPatient_Success() throws Exception {
        PatientRegisterRequest request = PatientRegisterRequest.builder()
                .name("João Silva")
                .email("joao.test@email.com")
                .password("MinhaSenh@123")
                .phone("(11) 99999-9999")
                .birthDate(LocalDate.of(1990, 1, 1))
                .build();

        mockMvc.perform(post("/auth/register/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value("joao.test@email.com"))
                .andExpect(jsonPath("$.data.user.role").value("PATIENT"));
    }

    @Test
    void registerPatient_InvalidEmail() throws Exception {
        PatientRegisterRequest request = PatientRegisterRequest.builder()
                .name("João Silva")
                .email("invalid-email")
                .password("MinhaSenh@123")
                .build();

        mockMvc.perform(post("/auth/register/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    void registerPatient_WeakPassword() throws Exception {
        PatientRegisterRequest request = PatientRegisterRequest.builder()
                .name("João Silva")
                .email("joao2@email.com")
                .password("123")
                .build();

        mockMvc.perform(post("/auth/register/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    void login_WithSeedUser() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("joao@email.com")
                .password("paciente123")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value("joao@email.com"))
                .andExpect(jsonPath("$.data.user.role").value("PATIENT"));
    }

    @Test
    void login_InvalidCredentials() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("joao@email.com")
                .password("wrong-password")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("error"));
    }
}