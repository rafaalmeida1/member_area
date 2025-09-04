package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.response.analytics.*;
import br.rafaalmeida1.nutri_thata_api.entities.*;
import br.rafaalmeida1.nutri_thata_api.repository.LinkClickRepository;
import br.rafaalmeida1.nutri_thata_api.repository.PageViewRepository;
import br.rafaalmeida1.nutri_thata_api.repository.ProfessionalLinkRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.ProfessionalProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final LinkClickRepository linkClickRepository;
    private final PageViewRepository pageViewRepository;
    private final ProfessionalLinkRepository linkRepository;
    private final ProfessionalProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public PageAnalyticsResponse getPageAnalytics(User user, LocalDateTime startDate, LocalDateTime endDate) {
        ProfessionalProfile profile = findProfessionalProfile(user);
        
        PageAnalyticsResponse response = new PageAnalyticsResponse();
        response.setProfessionalId(profile.getId());
        
        // Estatísticas gerais
        response.setTotalViews(pageViewRepository.countByProfessionalProfile(profile));
        response.setUniqueViews(pageViewRepository.countUniqueViewsByProfessionalProfile(profile));
        response.setTotalClicks(linkClickRepository.countByProfessionalProfile(profile));
        response.setAverageSessionDuration(pageViewRepository.findAverageSessionDurationByProfessionalProfile(profile));
        
        // Views por data
        List<Object[]> viewsByDateData = pageViewRepository.findViewsByDateForProfile(profile, startDate, endDate);
        List<ViewsByDateResponse> viewsByDate = viewsByDateData.stream()
            .map(row -> {
                ViewsByDateResponse viewData = new ViewsByDateResponse();
                viewData.setDate((LocalDate) row[0]);
                viewData.setViews((Long) row[1]);
                viewData.setUniqueViews((Long) row[2]);
                return viewData;
            })
            .collect(Collectors.toList());
        response.setViewsByDate(viewsByDate);
        
        // Views por país
        List<Object[]> viewsByCountryData = pageViewRepository.findViewsByCountryForProfile(profile);
        Map<String, Long> viewsByCountry = viewsByCountryData.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0], 
                row -> (Long) row[1],
                (existing, replacement) -> existing
            ));
        response.setViewsByCountry(viewsByCountry);
        
        // Views por dispositivo
        List<Object[]> viewsByDeviceData = pageViewRepository.findViewsByDeviceForProfile(profile);
        Map<String, Long> viewsByDevice = viewsByDeviceData.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0], 
                row -> (Long) row[1],
                (existing, replacement) -> existing
            ));
        response.setViewsByDevice(viewsByDevice);
        
        // Views por navegador
        List<Object[]> viewsByBrowserData = pageViewRepository.findViewsByBrowserForProfile(profile);
        Map<String, Long> viewsByBrowser = viewsByBrowserData.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0], 
                row -> (Long) row[1],
                (existing, replacement) -> existing
            ));
        response.setViewsByBrowser(viewsByBrowser);
        
        // Top links
        List<ProfessionalLink> topLinks = linkRepository.findTopLinksByClickCount(profile);
        List<LinkAnalyticsResponse> topLinksResponse = topLinks.stream()
            .limit(10)
            .map(link -> getLinkAnalytics(link, startDate, endDate))
            .collect(Collectors.toList());
        response.setTopLinks(topLinksResponse);
        
        // Usuários autenticados
        List<Object[]> authenticatedUsersData = pageViewRepository.findAuthenticatedUsersByProfile(profile);
        List<UserClickResponse> authenticatedUsers = authenticatedUsersData.stream()
            .map(row -> {
                UserClickResponse userResponse = new UserClickResponse();
                userResponse.setUserId((Long) row[0]);
                userResponse.setUserName((String) row[1]);
                userResponse.setUserEmail((String) row[2]);
                userResponse.setTotalViews((Long) row[3]);
                userResponse.setLastActivityAt((LocalDateTime) row[4]);
                
                // Buscar cliques do usuário
                User user1 = new User();
                user1.setId((Long) row[0]);
                userResponse.setTotalClicks(linkClickRepository.countByUserAndProfessionalProfile(user1, profile));
                
                return userResponse;
            })
            .collect(Collectors.toList());
        response.setAuthenticatedUsers(authenticatedUsers);
        
        return response;
    }

    @Transactional(readOnly = true)
    public LinkAnalyticsResponse getLinkAnalytics(Long linkId, User user, LocalDateTime startDate, LocalDateTime endDate) {
        ProfessionalProfile profile = findProfessionalProfile(user);
        ProfessionalLink link = linkRepository.findByIdAndProfessionalProfile(linkId, profile)
            .orElseThrow(() -> new RuntimeException("Link não encontrado"));
        
        return getLinkAnalytics(link, startDate, endDate);
    }

    private LinkAnalyticsResponse getLinkAnalytics(ProfessionalLink link, LocalDateTime startDate, LocalDateTime endDate) {
        LinkAnalyticsResponse response = new LinkAnalyticsResponse();
        response.setLinkId(link.getId());
        response.setLinkTitle(link.getTitle());
        response.setTotalClicks(linkClickRepository.countByProfessionalLink(link));
        response.setUniqueClicks(linkClickRepository.countUniqueClicksByProfessionalLink(link));
        
        // Cliques por data
        List<Object[]> clicksByDateData = linkClickRepository.findClicksByDateForLink(link, startDate, endDate);
        List<ClicksByDateResponse> clicksByDate = clicksByDateData.stream()
            .map(row -> {
                ClicksByDateResponse clickData = new ClicksByDateResponse();
                clickData.setDate((LocalDate) row[0]);
                clickData.setClicks((Long) row[1]);
                clickData.setUniqueClicks((Long) row[2]);
                return clickData;
            })
            .collect(Collectors.toList());
        response.setClicksByDate(clicksByDate);
        
        // Cliques por país
        List<Object[]> clicksByCountryData = linkClickRepository.findClicksByCountryForLink(link);
        Map<String, Long> clicksByCountry = clicksByCountryData.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0], 
                row -> (Long) row[1],
                (existing, replacement) -> existing
            ));
        response.setClicksByCountry(clicksByCountry);
        
        // Cliques por dispositivo
        List<Object[]> clicksByDeviceData = linkClickRepository.findClicksByDeviceForLink(link);
        Map<String, Long> clicksByDevice = clicksByDeviceData.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0], 
                row -> (Long) row[1],
                (existing, replacement) -> existing
            ));
        response.setClicksByDevice(clicksByDevice);
        
        // Cliques por navegador
        List<Object[]> clicksByBrowserData = linkClickRepository.findClicksByBrowserForLink(link);
        Map<String, Long> clicksByBrowser = clicksByBrowserData.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0], 
                row -> (Long) row[1],
                (existing, replacement) -> existing
            ));
        response.setClicksByBrowser(clicksByBrowser);
        
        return response;
    }

    @Transactional
    public void trackPageView(Long professionalId, String ipAddress, String userAgent, 
                             String referer, User user, Long sessionDuration) {
        ProfessionalProfile profile = profileRepository.findById(professionalId)
            .orElseThrow(() -> new RuntimeException("Perfil profissional não encontrado"));
        
        PageView pageView = PageView.builder()
            .professionalProfile(profile)
            .user(user)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .referer(referer)
            .sessionDuration(sessionDuration)
            .build();
        
        // Extrair informações do user agent
        extractDeviceInfo(userAgent, pageView);
        
        pageViewRepository.save(pageView);
    }

    @Transactional
    public void trackLinkClick(Long linkId, String ipAddress, String userAgent, 
                              String referer, User user) {
        ProfessionalLink link = linkRepository.findById(linkId)
            .orElseThrow(() -> new RuntimeException("Link não encontrado"));
        
        LinkClick linkClick = LinkClick.builder()
            .professionalLink(link)
            .user(user)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .referer(referer)
            .build();
        
        // Extrair informações do user agent
        extractDeviceInfo(userAgent, linkClick);
        
        linkClickRepository.save(linkClick);
        
        // Incrementar contador de cliques
        link.setClickCount(link.getClickCount() + 1);
        linkRepository.save(link);
    }

    private void extractDeviceInfo(String userAgent, PageView pageView) {
        if (userAgent != null) {
            // Lógica simples para detectar dispositivo
            if (userAgent.toLowerCase().contains("mobile")) {
                pageView.setDeviceType("Mobile");
            } else if (userAgent.toLowerCase().contains("tablet")) {
                pageView.setDeviceType("Tablet");
            } else {
                pageView.setDeviceType("Desktop");
            }
            
            // Detectar navegador
            if (userAgent.contains("Chrome")) {
                pageView.setBrowser("Chrome");
            } else if (userAgent.contains("Firefox")) {
                pageView.setBrowser("Firefox");
            } else if (userAgent.contains("Safari")) {
                pageView.setBrowser("Safari");
            } else if (userAgent.contains("Edge")) {
                pageView.setBrowser("Edge");
            } else {
                pageView.setBrowser("Other");
            }
            
            // Detectar sistema operacional
            if (userAgent.contains("Windows")) {
                pageView.setOperatingSystem("Windows");
            } else if (userAgent.contains("Mac")) {
                pageView.setOperatingSystem("macOS");
            } else if (userAgent.contains("Linux")) {
                pageView.setOperatingSystem("Linux");
            } else if (userAgent.contains("Android")) {
                pageView.setOperatingSystem("Android");
            } else if (userAgent.contains("iOS")) {
                pageView.setOperatingSystem("iOS");
            } else {
                pageView.setOperatingSystem("Other");
            }
        }
    }

    private void extractDeviceInfo(String userAgent, LinkClick linkClick) {
        if (userAgent != null) {
            // Lógica simples para detectar dispositivo
            if (userAgent.toLowerCase().contains("mobile")) {
                linkClick.setDeviceType("Mobile");
            } else if (userAgent.toLowerCase().contains("tablet")) {
                linkClick.setDeviceType("Tablet");
            } else {
                linkClick.setDeviceType("Desktop");
            }
            
            // Detectar navegador
            if (userAgent.contains("Chrome")) {
                linkClick.setBrowser("Chrome");
            } else if (userAgent.contains("Firefox")) {
                linkClick.setBrowser("Firefox");
            } else if (userAgent.contains("Safari")) {
                linkClick.setBrowser("Safari");
            } else if (userAgent.contains("Edge")) {
                linkClick.setBrowser("Edge");
            } else {
                linkClick.setBrowser("Other");
            }
            
            // Detectar sistema operacional
            if (userAgent.contains("Windows")) {
                linkClick.setOperatingSystem("Windows");
            } else if (userAgent.contains("Mac")) {
                linkClick.setOperatingSystem("macOS");
            } else if (userAgent.contains("Linux")) {
                linkClick.setOperatingSystem("Linux");
            } else if (userAgent.contains("Android")) {
                linkClick.setOperatingSystem("Android");
            } else if (userAgent.contains("iOS")) {
                linkClick.setOperatingSystem("iOS");
            } else {
                linkClick.setOperatingSystem("Other");
            }
        }
    }

    private ProfessionalProfile findProfessionalProfile(User user) {
        return profileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Perfil profissional não encontrado"));
    }
}
