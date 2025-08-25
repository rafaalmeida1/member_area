import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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
  onNavigateToHome: () => void;
  onNavigateToModules: () => void;
  onNavigateToInvites: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToPatientManagement: () => void;
  professionalName?: string;
}

export function MyAccount({
  professionalName
}: MyAccountProps) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Carregar estatísticas do usuário
  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
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
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedUser = await apiService.updateCurrentUser(profileForm);
      updateUser(updatedUser);
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

  return (
    <Layout
      title="Minha Conta"
      professionalName={professionalName}
    >
      <div className="my-account-container">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
            <TabsTrigger value="stats">Minhas Estatísticas</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="profile-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Nome Completo</label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Telefone</label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Data de Nascimento</label>
                      <Input
                        type="date"
                        value={profileForm.birthDate}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, birthDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
              {userStats ? (
                <>
                  {/* Resumo das Estatísticas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Resumo do Seu Progresso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="stats-overview-grid">
                        <div className="stat-card">
                          <div className="stat-icon">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">{userStats.totalModulesViewed}</div>
                            <div className="stat-label">Módulos Visualizados</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">{formatTime(userStats.totalTimeSpent)}</div>
                            <div className="stat-label">Tempo Total</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">
                            <Award className="w-6 h-6" />
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">{userStats.modulesCompleted}</div>
                            <div className="stat-label">Módulos Completados</div>
                          </div>
                        </div>
                        
                        <div className="stat-card">
                          <div className="stat-icon">
                            <Target className="w-6 h-6" />
                          </div>
                          <div className="stat-content">
                            <div className="stat-value">{userStats.progressPercentage}%</div>
                            <div className="stat-label">Progresso Geral</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Atividade Recente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Atividade Recente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="activity-details">
                        <div className="activity-item">
                          <Calendar className="w-4 h-4" />
                          <span>Última atividade: {formatDate(userStats.lastActivity)}</span>
                        </div>
                        <div className="activity-item">
                          <Clock className="w-4 h-4" />
                          <span>Tempo médio por sessão: {formatTime(userStats.averageSessionTime)}</span>
                        </div>
                        <div className="activity-item">
                          <TrendingUp className="w-4 h-4" />
                          <span>Status: {getActivityStatus(userStats.lastActivity).label}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Categorias Favoritas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Suas Categorias Favoritas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="categories-section">
                        {userStats.favoriteCategories.length > 0 ? (
                          <div className="categories-grid">
                            {userStats.favoriteCategories.map((category, index) => (
                              <Badge key={index} variant="outline" className="category-badge">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
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
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="password-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Senha Atual</label>
                      <div className="password-input-container">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Digite sua senha atual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Nova Senha</label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite a nova senha"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Confirmar Nova Senha</label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <Button onClick={handleChangePassword} disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 