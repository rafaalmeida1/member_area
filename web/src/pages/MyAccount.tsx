import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  Clock, 
  Target, 
  Award,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  Save,
  Eye,
  EyeOff,
  Plus,
  X,
  Camera,
  Image
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiService, ProfessionalProfile } from '@/services/api';
import { ModernLayout } from '@/components/ModernLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FileUpload } from '@/components/FileUpload';
import { BannerPreview } from '@/components/BannerPreview';
import { BannerPositionControl } from '@/components/BannerPositionControl';
import { ThemeSettings } from '@/components/ThemeSettings';
import { ThemeManager } from '@/components/ThemeManager';
import './MyAccount.css';

interface UserStats {
  totalModulesViewed: number;
  totalTimeSpent: number; // em minutos
  lastActivity: string;
  modulesCompleted: number;
  averageSessionTime: number;
  favoriteCategories: string[];
  progressPercentage: number;
  weeklyActivity: {
    date: string;
    modulesViewed: number;
    timeSpent: number;
  }[];
}

interface MyAccountProps {
  professionalName?: string;
}

export function MyAccount({
  professionalName
}: MyAccountProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || ''
  });

  const [professionalForm, setProfessionalForm] = useState({
    name: '',
    title: '',
    bio: '',
    image: '',
    backgroundImage: '',
    backgroundPositionX: 50,
    backgroundPositionY: 50,
    specialties: [] as string[]
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const loadUserStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const stats = await apiService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível carregar suas estatísticas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadProfessionalProfile = useCallback(async () => {
    try {
      const profile = await apiService.getProfessionalProfile();
      setProfessionalProfile(profile);
              setProfessionalForm({
          name: profile.name || '',
          title: profile.title || '',
          bio: profile.bio || '',
          image: profile.image || '',
          backgroundImage: profile.backgroundImage || '',
          backgroundPositionX: profile.backgroundPositionX || 50,
          backgroundPositionY: profile.backgroundPositionY || 50,
          specialties: profile.specialties || []
        });
    } catch (error) {
      console.error('Erro ao carregar perfil profissional:', error);
      toast({
        title: "Erro ao carregar perfil profissional",
        description: "Não foi possível carregar seu perfil profissional.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Carregar estatísticas do usuário
  useEffect(() => {
    loadUserStats();
    if (user?.role === 'PROFESSIONAL') {
      loadProfessionalProfile();
    }
  }, [user, loadUserStats, loadProfessionalProfile]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedUser = await apiService.updateCurrentUser(profileForm);
      // updateUser(updatedUser);
      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar seus dados.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfessional = async () => {
    try {
      setIsSaving(true);
      const updateData = {
        name: professionalForm.name,
        title: professionalForm.title,
        bio: professionalForm.bio || undefined,
        image: professionalForm.image || undefined,
        backgroundImage: professionalForm.backgroundImage || undefined,
        backgroundPositionX: professionalForm.backgroundPositionX,
        backgroundPositionY: professionalForm.backgroundPositionY,
        specialties: professionalForm.specialties.length > 0 ? professionalForm.specialties : undefined
      };

      const updatedProfile = await apiService.updateProfessionalProfile(updateData);
      setProfessionalProfile(updatedProfile);
      
      toast({
        title: "Perfil profissional atualizado",
        description: "Seus dados profissionais foram atualizados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil profissional:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar seus dados profissionais.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await apiService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro ao alterar senha",
        description: "Verifique se a senha atual está correta.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !professionalForm.specialties.includes(newSpecialty.trim())) {
      setProfessionalForm(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setProfessionalForm(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getActivityStatus = (lastActivity: string) => {
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return { status: 'online', label: 'Online hoje', color: 'bg-green-500' };
    if (diffInDays <= 7) return { status: 'recent', label: 'Ativo recentemente', color: 'bg-yellow-500' };
    return { status: 'inactive', label: 'Inativo', color: 'bg-red-500' };
  };

  // Determinar quais abas mostrar baseado no role do usuário
  const isProfessional = user?.role === 'PROFESSIONAL';
  const tabs = isProfessional 
    ? ['profile', 'professional', 'stats', 'security']
    : ['profile', 'stats', 'security'];

  return (
    <ModernLayout
      title="Minha Conta"
    >
      <div className="w-full min-w-0">
        <Tabs defaultValue="profile" className="w-full">
          <div className="w-full overflow-hidden">
            <TabsList className="flex w-full overflow-x-auto scrollbar-hide gap-1 p-1">
              <TabsTrigger value="profile" className="text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">Meu Perfil</TabsTrigger>
              {isProfessional && <TabsTrigger value="professional" className="text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">Perfil Profissional</TabsTrigger>}
              {isProfessional && <TabsTrigger value="theme" className="text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">Tema</TabsTrigger>}
              <TabsTrigger value="stats" className="text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">Estatísticas</TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">Segurança</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome Completo</label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Seu nome completo"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Nascimento</label>
                      <Input
                        type="date"
                        value={profileForm.birthDate}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-sm sm:text-base">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isProfessional && (
            <TabsContent value="professional" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    Perfil Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome Profissional</label>
                        <Input
                          value={professionalForm.name}
                          onChange={(e) => setProfessionalForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Seu nome profissional"
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Título Profissional</label>
                        <Input
                          value={professionalForm.title}
                          onChange={(e) => setProfessionalForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Nutricionista Especialista"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Biografia</label>
                      <Textarea
                        value={professionalForm.bio}
                        onChange={(e) => setProfessionalForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Conte um pouco sobre sua experiência e especialidades..."
                        rows={4}
                        className="text-sm"
                      />
                    </div>

                    {/* Imagem de Fundo */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Imagem de Fundo do Banner</label>
                      <FileUpload
                        type="image"
                        currentUrl={professionalForm.backgroundImage}
                        field="backgroundImage"
                        onFileSelect={(url) => setProfessionalForm(prev => ({ ...prev, backgroundImage: url }))}
                        specifications={{
                          title: "Imagem de Fundo do Banner",
                          description: "Esta imagem será exibida como fundo do banner na tela principal",
                          dimensions: "1920x640 pixels (proporção 3:1)",
                          format: "JPG, PNG, WebP",
                          maxSize: "10MB",
                          tips: [
                            "Use uma imagem que represente bem sua área profissional",
                            "A imagem será centralizada e cortada automaticamente",
                            "Evite textos ou elementos importantes nas bordas",
                            "Recomendamos imagens com boa luminosidade e contraste",
                            "A imagem terá um overlay escuro aplicado automaticamente"
                          ]
                        }}
                      />
                    </div>

                    {/* Preview do Banner */}
                    {professionalForm.backgroundImage && (
                      <BannerPreview 
                        imageUrl={professionalForm.backgroundImage}
                        positionX={professionalForm.backgroundPositionX}
                        positionY={professionalForm.backgroundPositionY}
                        title="Como aparecerá no banner"
                        description="Preview das dimensões reais do banner na tela principal"
                      />
                    )}

                    {/* Controle de Posicionamento do Banner */}
                    {professionalForm.backgroundImage && (
                      <BannerPositionControl
                        positionX={professionalForm.backgroundPositionX}
                        positionY={professionalForm.backgroundPositionY}
                        imageUrl={professionalForm.backgroundImage}
                        onPositionChange={(x, y) => setProfessionalForm(prev => ({
                          ...prev,
                          backgroundPositionX: x,
                          backgroundPositionY: y
                        }))}
                      />
                    )}

                    {/* Especialidades */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Especialidades</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            placeholder="Adicionar especialidade"
                            onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                            className="text-sm flex-1"
                          />
                          <Button onClick={addSpecialty} size="sm" className="w-full sm:w-auto">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs sm:text-sm">Adicionar</span>
                          </Button>
                        </div>
                      </div>
                      
                      {professionalForm.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {professionalForm.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                              {specialty}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => removeSpecialty(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botão Salvar */}
                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfessional} disabled={isSaving} className="w-full sm:w-auto">
                        <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        <span className="text-sm sm:text-base">
                          {isSaving ? 'Salvando...' : 'Salvar Perfil Profissional'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {isProfessional && (
            <TabsContent value="theme" className="space-y-6">
              <ThemeManager />
            </TabsContent>
          )}
          
          <TabsContent value="stats" className="space-y-4 sm:space-y-6">
              {userStats ? (
                <>
                  {/* Resumo das Estatísticas */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                        Resumo do Seu Progresso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                        <div className="text-center p-3 sm:p-4 border rounded-lg">
                          <div className="flex justify-center mb-2">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="text-lg sm:text-2xl font-bold">{userStats.totalModulesViewed}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Módulos Visualizados</div>
                        </div>
                        
                        <div className="text-center p-3 sm:p-4 border rounded-lg">
                          <div className="flex justify-center mb-2">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="text-lg sm:text-2xl font-bold">{formatTime(userStats.totalTimeSpent)}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Tempo Total</div>
                        </div>
                        
                        <div className="text-center p-3 sm:p-4 border rounded-lg">
                          <div className="flex justify-center mb-2">
                            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="text-lg sm:text-2xl font-bold">{userStats.modulesCompleted}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Módulos Completados</div>
                        </div>
                        
                        <div className="text-center p-3 sm:p-4 border rounded-lg">
                          <div className="flex justify-center mb-2">
                            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="text-lg sm:text-2xl font-bold">{userStats.progressPercentage}%</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Progresso Geral</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Atividade Recente */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                        Atividade Recente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm sm:text-base">Última atividade: {formatDate(userStats.lastActivity)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm sm:text-base">Tempo médio por sessão: {formatTime(userStats.averageSessionTime)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm sm:text-base">Status: {getActivityStatus(userStats.lastActivity).label}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Categorias Favoritas */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                        Suas Categorias Favoritas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div>
                        {userStats.favoriteCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {userStats.favoriteCategories.map((category, index) => (
                              <Badge key={index} variant="outline" className="text-xs sm:text-sm">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm sm:text-base text-muted-foreground">
                            Continue explorando módulos para descobrir suas categorias favoritas!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div>Carregando suas estatísticas <LoadingSpinner /></div>
              )}
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Senha Atual</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Digite sua senha atual"
                          className="text-sm pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-0 h-full px-3"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nova Senha</label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite a nova senha"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirmar Nova Senha</label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme a nova senha"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleChangePassword} disabled={isSaving} className="w-full sm:w-auto">
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-sm sm:text-base">
                        {isSaving ? 'Alterando...' : 'Alterar Senha'}
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
} 