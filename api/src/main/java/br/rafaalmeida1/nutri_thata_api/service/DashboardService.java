package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.response.dashboard.DashboardStatsResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.dashboard.ProfessionalInfoResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.module.ModuleResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.enums.Role;
import br.rafaalmeida1.nutri_thata_api.mapper.ModuleMapper;
import br.rafaalmeida1.nutri_thata_api.repositories.InviteRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.ModuleRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.ProfessionalProfileRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final UserRepository userRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ModuleRepository moduleRepository;
    private final InviteRepository inviteRepository;
    private final ModuleMapper moduleMapper;

    /**
     * Busca informações do profissional para o dashboard
     */
    public ProfessionalInfoResponse getProfessionalInfo(User user) {
        if (!user.getRole().equals(Role.PROFESSIONAL)) {
            throw new IllegalArgumentException("Apenas profissionais podem acessar informações profissionais");
        }

        ProfessionalProfile profile = professionalProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Perfil profissional não encontrado"));

        return ProfessionalInfoResponse.builder()
                .name(user.getName())
                .title(profile.getTitle())
                .bio(profile.getBio())
                .specialties(profile.getSpecialties())
                .image(profile.getImage())
                .backgroundImage(profile.getBackgroundImage())
                .build();
    }

    /**
     * Busca estatísticas do dashboard
     */
    public DashboardStatsResponse getDashboardStats(User user) {
        if (user.getRole().equals(Role.PROFESSIONAL)) {
            return getProfessionalStats(user);
        } else {
            return getPatientStats(user);
        }
    }

    /**
     * Estatísticas para profissionais
     */
    private DashboardStatsResponse getProfessionalStats(User professional) {
        // Total de pacientes (usuários que aceitaram convites deste profissional)
        long totalPatients = userRepository.countPatientsByProfessional(professional.getId());
        
        // Pacientes ativos (que fizeram login nos últimos 30 dias)
        long activePatients = userRepository.countActivePatientsByProfessional(professional.getId(), LocalDateTime.now().minusDays(30));
        
        // Total de módulos criados
        long totalModules = moduleRepository.countByCreatedBy(professional);
        
        // Módulos ativos
        long activeModules = moduleRepository.countByCreatedByAndIsActive(professional, true);
        
        // Total de convites enviados
        long totalInvites = inviteRepository.countByCreatedBy(professional);
        
        // Convites enviados este mês
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long invitesThisMonth = inviteRepository.countByCreatedByAndCreatedAtAfter(professional, startOfMonth);
        
        // Total de visualizações (soma de todas as visualizações dos módulos)
        long totalViews = moduleRepository.sumViewCountByCreatedBy(professional);

        return DashboardStatsResponse.builder()
                .totalPatients((int) totalPatients)
                .activePatients((int) activePatients)
                .totalModules((int) totalModules)
                .activeModules((int) activeModules)
                .totalInvites((int) totalInvites)
                .invitesThisMonth((int) invitesThisMonth)
                .totalViews((int) totalViews)
                .build();
    }

    /**
     * Estatísticas para pacientes
     */
    private DashboardStatsResponse getPatientStats(User patient) {
        // Total de módulos disponíveis
        long totalModules = moduleRepository.countVisibleToPatient(patient.getId());
        
        // Por enquanto, retornar valores básicos até implementar o sistema de visualização/conclusão
        return DashboardStatsResponse.builder()
                .totalModules((int) totalModules)
                .viewedModules(0) // TODO: Implementar quando ModuleView estiver disponível
                .completedModules(0) // TODO: Implementar quando ModuleCompletion estiver disponível
                .totalStudyTime(0) // TODO: Implementar quando ModuleCompletion estiver disponível
                .build();
    }

    /**
     * Busca módulos para o dashboard
     */
    public List<ModuleResponse> getModulesForDashboard(User user) {
        List<br.rafaalmeida1.nutri_thata_api.entities.Module> modules;
        
        if (user.getRole().equals(Role.PROFESSIONAL)) {
            // Para profissionais, buscar módulos criados por eles
            modules = moduleRepository.findByCreatedByOrderByOrderIndexAsc(user);
        } else {
            // Para pacientes, buscar módulos visíveis
            modules = moduleRepository.findVisibleToPatient(user);
        }
        
        return modules.stream()
                .map(moduleMapper::toModuleResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}
