import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModernLayout } from '@/components/ModernLayout';
import { DashboardStats } from '@/components/DashboardStats';
import { Login } from './Login';
import { dashboardService, ProfessionalInfo, Module } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  User,
  Award
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { handleError } = useErrorHandler();

  // Se não estiver autenticado, mostrar login
  if (!isAuthenticated || !user) {
    return <Login />;
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterModules();
  }, [modules, searchTerm, filterCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'PROFESSIONAL') {
        const [profInfo, modulesList] = await Promise.all([
          dashboardService.getProfessionalInfo(),
          dashboardService.getModules()
        ]);
        setProfessionalInfo(profInfo);
        setModules(modulesList);
      } else {
        // Para pacientes, buscar módulos disponíveis
        const modulesList = await dashboardService.getModules();
        setModules(modulesList);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const filterModules = () => {
    let filtered = modules;

    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(module => module.category === filterCategory);
    }

    setFilteredModules(filtered);
  };

  const categories = Array.from(new Set(modules.map(m => m.category).filter(Boolean)));

  return (
    <ModernLayout title="Dashboard">
      {/* Background com tema */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
      
      <div className="space-y-6">
        {/* Professional Info Section - Only for professionals */}
        {user.role === 'PROFESSIONAL' && professionalInfo && (
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-6 md:p-8">
            {professionalInfo.backgroundImage && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${professionalInfo.backgroundImage})` }}
              />
            )}
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                {professionalInfo.image ? (
                  <img
                    src={professionalInfo.image}
                    alt={professionalInfo.name}
                    className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover ring-4 ring-background"
                  />
                ) : (
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-background">
                    <User className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold">{professionalInfo.name}</h1>
                <p className="text-lg text-primary font-medium">{professionalInfo.title}</p>
                <p className="text-muted-foreground max-w-2xl">{professionalInfo.bio}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {professionalInfo.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section for Patients */}
        {user.role !== 'PROFESSIONAL' && (
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Olá, {user.name}! 👋
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Continue sua jornada nutricional com os módulos disponíveis.
            </p>
          </div>
        )}

        {/* Dashboard Stats */}
        <DashboardStats userRole={user.role} />

        {/* Modules Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {user.role === 'PROFESSIONAL' ? 'Meus Módulos' : 'Módulos Disponíveis'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user.role === 'PROFESSIONAL' 
                  ? 'Gerencie e visualize seus conteúdos criados'
                  : 'Explore e estude os conteúdos preparados para você'
                }
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar módulos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category || ''}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modules Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
                : 'space-y-4'
            }>
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {module.description}
                          </p>
                        </div>
                        <Badge variant={module.isActive ? 'default' : 'secondary'}>
                          {module.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {module.duration || '30 min'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {module.viewCount} visualizações
                        </div>
                        {module.completionRate > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {Math.round(module.completionRate)}% conclusão
                          </div>
                        )}
                      </div>
                      <Button className="w-full" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        {user.role === 'PROFESSIONAL' ? 'Visualizar' : 'Estudar'}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm || filterCategory !== 'all' 
                      ? 'Nenhum módulo encontrado' 
                      : 'Nenhum módulo disponível'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {user.role === 'PROFESSIONAL' 
                      ? 'Crie seu primeiro módulo para começar.'
                      : 'Aguarde novos conteúdos serem disponibilizados.'
                    }
                  </p>
                  {user.role === 'PROFESSIONAL' && (
                    <Button className="mt-4">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Criar Módulo
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
};

export default Index;
