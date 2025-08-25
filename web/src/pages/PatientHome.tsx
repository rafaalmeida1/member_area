import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NutritionistBanner } from '@/components/NutritionistBanner';
import { ModuleCard } from '@/components/ModuleCard';
import { LoadingWrapper } from '@/components/LoadingSpinner';
import { ModuleSkeletonGrid } from '@/components/ModuleSkeleton';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { apiService, Module, ProfessionalProfile } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Star, 
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import './PatientHome.css';

interface PatientHomeProps {
  professionalName?: string;
}

export function PatientHome({ professionalName }: PatientHomeProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [modules, setModules] = useState<Module[]>([]);
  const [professional, setProfessional] = useState<ProfessionalProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProfessional, setIsLoadingProfessional] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(['Todos', ...response]);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        toast({
          title: "Erro ao carregar categorias",
          description: error instanceof Error ? error.message : "Erro inesperado",
          variant: "destructive",
        });
      }
    };

    loadCategories();
  }, [toast]);

  // Carregar módulos
  useEffect(() => {
    const loadModules = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getModules(
          selectedCategory === 'Todos' ? undefined : selectedCategory
        );
        setModules(response.content);
      } catch (error) {
        console.error('Erro ao carregar módulos:', error);
        toast({
          title: "Erro ao carregar módulos",
          description: error instanceof Error ? error.message : "Erro inesperado",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadModules();
  }, [selectedCategory, toast]);

  // Carregar dados do profissional
  useEffect(() => {
    const loadProfessional = async () => {
      try {
        setIsLoadingProfessional(true);
        const professionalData = await apiService.getBannerData();
        setProfessional(professionalData);
      } catch (error) {
        console.error('Erro ao carregar dados do profissional:', error);
      } finally {
        setIsLoadingProfessional(false);
      }
    };
    loadProfessional();
  }, []);

  const handleViewModule = (module: Module) => {
    // Navegar para a página do módulo usando React Router
    navigate(`/module/${module.id}`);
  };

  const filteredModules = selectedCategory === 'Todos' 
    ? modules 
    : modules.filter(module => module.category === selectedCategory);

  const stats = {
    totalModules: modules.length,
    completedModules: 0, // Implementar lógica de módulos completados
    inProgressModules: 0, // Implementar lógica de módulos em progresso
    averageRating: 4.8 // Implementar lógica de avaliação
  };

  return (
    <Layout
      title="Dashboard"
      professionalName={professionalName}
    >
      <div className="patient-home-container">
        {/* Hero Banner Section */}
        <section className="hero-banner-section" style={{
          backgroundImage: `url(${professional?.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top',
        }}>
          {/* {professional?.backgroundImage && (
            <div 
              className="hero-banner-background"
              style={{
                backgroundImage: `url(${professional.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )} */}
          <div className="hero-banner-overlay">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  {professional?.name || 'Profissional'}
                </h1>
                {professional?.title && (
                  <p className="hero-professional-title">
                    {professional.title}
                  </p>
                )}
                {professional?.bio && (
                  <p className="hero-subtitle">
                    {professional.bio}
                  </p>
                )}
                {professional?.specialties && professional.specialties.length > 0 && (
                  <div className="hero-specialties">
                    {professional.specialties.map((specialty, index) => (
                      <span key={index} className="specialty-tag">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="main-content">
          <div className="content-header">
            <div className="header-left">
              <h2 className="content-title">
                {selectedCategory === 'Todos' ? 'Todos os Módulos' : `Módulos - ${selectedCategory}`}
              </h2>
              <p className="content-subtitle">
                {filteredModules.length} módulo{filteredModules.length !== 1 ? 's' : ''} disponível{filteredModules.length !== 1 ? 'is' : ''}
              </p>
            </div>
            
            <div className="header-controls">
              {/* Category Filter */}
              <div className="category-filter">
                <Filter className="filter-icon" size={16} />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="category-select">
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <div className="view-mode-toggle">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="view-mode-btn"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="view-mode-btn"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Modules Content */}
          <LoadingWrapper loading={isLoading}>
            {filteredModules.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3 className="empty-title">Nenhum módulo encontrado</h3>
                <p className="empty-description">
                  {selectedCategory === 'Todos' 
                    ? 'Não há módulos disponíveis no momento.'
                    : `Não há módulos na categoria "${selectedCategory}".`
                  }
                </p>
              </div>
            ) : (
              <div className={`modules-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onView={() => handleViewModule(module)}
                  />
                ))}
              </div>
            )}
          </LoadingWrapper>
        </div>
      </div>
    </Layout>
  );
}