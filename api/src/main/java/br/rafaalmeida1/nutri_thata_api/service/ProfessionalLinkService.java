package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.dto.request.link.CreateLinkRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.link.ReorderLinksRequest;
import br.rafaalmeida1.nutri_thata_api.dto.request.link.UpdateLinkRequest;
import br.rafaalmeida1.nutri_thata_api.dto.response.link.LinkResponse;
import br.rafaalmeida1.nutri_thata_api.dto.response.link.PublicLinksResponse;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalLink;
import br.rafaalmeida1.nutri_thata_api.entities.ProfessionalProfile;
import br.rafaalmeida1.nutri_thata_api.entities.User;
import br.rafaalmeida1.nutri_thata_api.mapper.ProfessionalLinkMapper;
import br.rafaalmeida1.nutri_thata_api.mapper.PublicLinksMapper;
import br.rafaalmeida1.nutri_thata_api.repository.ProfessionalLinkRepository;
import br.rafaalmeida1.nutri_thata_api.repositories.ProfessionalProfileRepository;
import br.rafaalmeida1.nutri_thata_api.service.LinkPageProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfessionalLinkService {

    private final ProfessionalLinkRepository linkRepository;
    private final ProfessionalProfileRepository profileRepository;
    private final ProfessionalLinkMapper linkMapper;
    private final PublicLinksMapper publicLinksMapper;
    private final LinkPageProfileService linkPageProfileService;

    @Transactional(readOnly = true)
    public List<LinkResponse> getAllLinks(User user) {
        ProfessionalProfile profile = findProfessionalProfile(user);
        List<ProfessionalLink> links = linkRepository.findByProfessionalProfileOrderByDisplayOrderAsc(profile);
        return linkMapper.toResponseList(links);
    }

    @Transactional
    @CacheEvict(value = "publicLinks", key = "#user.id")
    public LinkResponse createLink(CreateLinkRequest request, User user) {
        ProfessionalProfile profile = findProfessionalProfile(user);
        
        ProfessionalLink link = linkMapper.toEntity(request);
        link.setProfessionalProfile(profile);
        
        // Define a ordem de exibição se não foi fornecida
        if (link.getDisplayOrder() == null) {
            Integer maxOrder = linkRepository.findMaxDisplayOrderByProfessionalProfile(profile);
            link.setDisplayOrder(maxOrder + 1);
        }
        
        link = linkRepository.save(link);
        return linkMapper.toResponse(link);
    }

    @Transactional
    @CacheEvict(value = "publicLinks", key = "#user.id")
    public LinkResponse updateLink(Long linkId, UpdateLinkRequest request, User user) {
        ProfessionalProfile profile = findProfessionalProfile(user);
        ProfessionalLink link = linkRepository.findByIdAndProfessionalProfile(linkId, profile)
            .orElseThrow(() -> new RuntimeException("Link não encontrado"));

        linkMapper.updateEntity(request, link);
        link = linkRepository.save(link);
        return linkMapper.toResponse(link);
    }

    @Transactional
    @CacheEvict(value = "publicLinks", key = "#user.id")
    public void deleteLink(Long linkId, User user) {
        ProfessionalProfile profile = findProfessionalProfile(user);
        ProfessionalLink link = linkRepository.findByIdAndProfessionalProfile(linkId, profile)
            .orElseThrow(() -> new RuntimeException("Link não encontrado"));

        linkRepository.delete(link);
    }

    @Transactional
    @CacheEvict(value = "publicLinks", key = "#user.id")
    public void reorderLinks(ReorderLinksRequest request, User user) {
        ProfessionalProfile profile = findProfessionalProfile(user);
        
        for (int i = 0; i < request.getLinkIds().size(); i++) {
            Long linkId = request.getLinkIds().get(i);
            ProfessionalLink link = linkRepository.findByIdAndProfessionalProfile(linkId, profile)
                .orElseThrow(() -> new RuntimeException("Link não encontrado: " + linkId));
            
            link.setDisplayOrder(i + 1);
            linkRepository.save(link);
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "publicLinks", key = "#professionalId")
    public PublicLinksResponse getPublicLinks(Long professionalId) {
        ProfessionalProfile profile = profileRepository.findById(professionalId)
            .orElseThrow(() -> new RuntimeException("Perfil profissional não encontrado"));

        List<ProfessionalLink> links = linkRepository.findByProfessionalProfileAndIsActiveTrueOrderByDisplayOrderAsc(profile);
        
        PublicLinksResponse response = publicLinksMapper.toResponse(profile);
        response.setLinks(linkMapper.toPublicResponseList(links));
        
        return response;
    }

    @Transactional
    public void incrementClickCount(Long linkId) {
        ProfessionalLink link = linkRepository.findById(linkId)
            .orElseThrow(() -> new RuntimeException("Link não encontrado"));
        
        link.setClickCount(link.getClickCount() + 1);
        linkRepository.save(link);
    }

    private ProfessionalProfile findProfessionalProfile(User user) {
        return profileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Perfil profissional não encontrado"));
    }
}
