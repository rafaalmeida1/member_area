package br.rafaalmeida1.nutri_thata_api.service;

import br.rafaalmeida1.nutri_thata_api.repositories.ModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final ModuleRepository moduleRepository;

    public List<String> getAllCategories() {
        log.info("Buscando todas as categorias de módulos");
        
        List<String> categories = moduleRepository.findDistinctCategories();
        
        // Adicionar algumas categorias padrão se não houver nenhuma
        if (categories.isEmpty()) {
            categories = getDefaultCategories();
        }
        
        log.info("Encontradas {} categorias", categories.size());
        return categories;
    }
    
    private List<String> getDefaultCategories() {
        List<String> defaultCategories = new ArrayList<>();
        defaultCategories.add("Fundamentos");
        defaultCategories.add("Planejamento Alimentar");
        defaultCategories.add("Nutrição Clínica");
        defaultCategories.add("Nutrição Esportiva");
        defaultCategories.add("Educação Nutricional");
        defaultCategories.add("Suplementação");
        defaultCategories.add("Patologias");
        return defaultCategories;
    }
}