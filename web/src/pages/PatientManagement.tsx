import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3, 
  Calendar, 
  BookOpen, 
  Clock,
  User,
  Mail,
  Phone,
  CalendarDays,
  TrendingUp,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, Patient, PatientStats } from '@/services/api';
import { Layout } from '@/components/Layout';
import { LoadingWrapper } from '@/components/LoadingSpinner';
import './PatientManagement.css';

interface PatientManagementProps {
  onNavigateToHome: () => void;
  onNavigateToModules: () => void;
  onNavigateToInvites: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToPatientManagement: () => void;
  professionalName?: string;
}

export function PatientManagement({
  onNavigateToHome,
  onNavigateToModules,
  onNavigateToInvites,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToPatientManagement,
  professionalName
}: PatientManagementProps) {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: ''
  });

  // Carregar pacientes
  useEffect(() => {
    loadPatients();
  }, []);

  // Filtrar pacientes
  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllPatientsWithStats();
      setPatients(response);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast({
        title: "Erro ao carregar pacientes",
        description: "Não foi possível carregar a lista de pacientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setEditForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone || '',
      birthDate: patient.birthDate || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPatient) return;

    try {
      await apiService.updatePatient(editingPatient.id, editForm);
      toast({
        title: "Paciente atualizado",
        description: "Dados do paciente foram atualizados com sucesso.",
      });
      setShowEditModal(false);
      loadPatients(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados do paciente.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivatePatient = async (patientId: number) => {
    if (!confirm('Tem certeza que deseja desativar este paciente?')) return;

    try {
      await apiService.deactivatePatient(patientId);
      toast({
        title: "Paciente desativado",
        description: "O paciente foi desativado com sucesso.",
      });
      loadPatients(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao desativar paciente:', error);
      toast({
        title: "Erro ao desativar",
        description: "Não foi possível desativar o paciente.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '') {
      return 'Nunca';
    }
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getActivityStatus = (lastActivity: string) => {
    if (!lastActivity || lastActivity === '') {
      return { status: 'inactive', label: 'Nunca ativo', color: 'bg-gray-500' };
    }
    
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return { status: 'online', label: 'Online hoje', color: 'bg-green-500' };
    if (diffInDays <= 7) return { status: 'recent', label: 'Ativo recentemente', color: 'bg-yellow-500' };
    return { status: 'inactive', label: 'Inativo', color: 'bg-red-500' };
  };

  return (
    <Layout
      title="Gerenciamento de Pacientes"
      onNavigateToHome={onNavigateToHome}
      onNavigateToModules={onNavigateToModules}
      onNavigateToInvites={onNavigateToInvites}
      onNavigateToProfile={onNavigateToProfile}
      onNavigateToSettings={onNavigateToSettings}
      professionalName={professionalName}
    >
      <div className="patient-management-container">
        {/* Header com estatísticas gerais */}
        <div className="stats-overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Visão Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{patients.length}</div>
                  <div className="stat-label text-muted-foreground">Total de Pacientes</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {patients.filter(p => p.isActive).length}
                  </div>
                  <div className="stat-label text-muted-foreground">Pacientes Ativos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {patients.filter(p => p.stats?.totalModulesViewed > 0).length}
                  </div>
                  <div className="stat-label text-muted-foreground">Com Atividade</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {Math.round(patients.reduce((acc, p) => acc + (p.stats?.progressPercentage || 0), 0) / patients.length || 0)}%
                  </div>
                  <div className="stat-label text-muted-foreground">Progresso Médio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de pesquisa */}
        <div className="search-section">
          <div className="search-input-container">
            <Input
              placeholder="Pesquisar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Lista de pacientes */}
        <div className="patients-section">
          <LoadingWrapper loading={isLoading} loadingMessage="Carregando pacientes...">
            <div className="patients-grid">
              {filteredPatients.map(patient => (
                <Card key={patient.id} className="patient-card">
                  <CardHeader>
                    <div className="patient-header">
                      <div className="patient-avatar">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="patient-info">
                        <h3 className="patient-name">{patient.name}</h3>
                        <p className="patient-email">{patient.email}</p>
                        <div className="patient-status">
                          <Badge 
                            variant={patient.isActive ? "default" : "secondary"}
                            className="status-badge"
                          >
                            {patient.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <div className={`activity-indicator ${getActivityStatus(patient.stats?.lastActivity || '').color}`} />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="patient-stats-preview">
                      <div className="stat-preview">
                        <BookOpen className="w-4 h-4" />
                        <span>{patient.stats?.totalModulesViewed || 0} módulos</span>
                      </div>
                      <div className="stat-preview">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(patient.stats?.totalTimeSpent || 0)}</span>
                      </div>
                      <div className="stat-preview">
                        <Target className="w-4 h-4" />
                        <span>{patient.stats?.progressPercentage || 0}%</span>
                      </div>
                    </div>
                    
                    <div className="patient-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPatient(patient)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPatient(patient)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivatePatient(patient.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Desativar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </LoadingWrapper>
        </div>

        {/* Modal de detalhes do paciente */}
        <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Paciente</DialogTitle>
            </DialogHeader>
            
            {selectedPatient && (
              <div className="patient-details">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Informações</TabsTrigger>
                    <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                    <TabsTrigger value="activity">Atividade</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Nome</label>
                        <span>{selectedPatient.name}</span>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <span>{selectedPatient.email}</span>
                      </div>
                      <div className="info-item">
                        <label>Telefone</label>
                        <span>{selectedPatient.phone || 'Não informado'}</span>
                      </div>
                      <div className="info-item">
                        <label>Data de Nascimento</label>
                        <span>{selectedPatient.birthDate ? formatDate(selectedPatient.birthDate) : 'Não informado'}</span>
                      </div>
                      <div className="info-item">
                        <label>Status</label>
                        <Badge variant={selectedPatient.isActive ? "default" : "secondary"}>
                          {selectedPatient.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="info-item">
                        <label>Membro desde</label>
                        <span>{formatDate(selectedPatient.createdAt)}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="space-y-4">
                    <div className="stats-grid-detailed">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Métricas Gerais</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="metrics-grid">
                            <div className="metric-item">
                              <div className="metric-icon">
                                <BookOpen className="w-6 h-6" />
                              </div>
                              <div className="metric-content">
                                <div className="metric-value">{selectedPatient.stats?.totalModulesViewed || 0}</div>
                                <div className="metric-label">Módulos Visualizados</div>
                              </div>
                            </div>
                            <div className="metric-item">
                              <div className="metric-icon">
                                <Clock className="w-6 h-6" />
                              </div>
                              <div className="metric-content">
                                <div className="metric-value">{formatTime(selectedPatient.stats?.totalTimeSpent || 0)}</div>
                                <div className="metric-label">Tempo Total</div>
                              </div>
                            </div>
                            <div className="metric-item">
                              <div className="metric-icon">
                                <Award className="w-6 h-6" />
                              </div>
                              <div className="metric-content">
                                <div className="metric-value">{selectedPatient.stats?.modulesCompleted || 0}</div>
                                <div className="metric-label">Módulos Completados</div>
                              </div>
                            </div>
                            <div className="metric-item">
                              <div className="metric-icon">
                                <Target className="w-6 h-6" />
                              </div>
                              <div className="metric-content">
                                <div className="metric-value">{selectedPatient.stats?.progressPercentage || 0}%</div>
                                <div className="metric-label">Progresso Geral</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Categorias Favoritas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="categories-list">
                                            {selectedPatient.stats?.favoriteCategories?.length > 0 ? (
                  selectedPatient.stats.favoriteCategories.map((category, index) => (
                                <Badge key={index} variant="outline" className="category-badge">
                                  {category}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-muted-foreground">Nenhuma categoria favorita ainda</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Atividade Recente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="activity-info">
                          <div className="activity-item">
                            <Calendar className="w-4 h-4" />
                            <span>Última atividade: {formatDate(selectedPatient.stats?.lastActivity || '')}</span>
                          </div>
                          <div className="activity-item">
                            <Clock className="w-4 h-4" />
                            <span>Tempo médio por sessão: {formatTime(selectedPatient.stats?.averageSessionTime || 0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edição */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
            </DialogHeader>
            
            <div className="edit-form space-y-4">
              <div>
                <label className="form-label">Nome</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Telefone</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Data de Nascimento</label>
                <Input
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
} 