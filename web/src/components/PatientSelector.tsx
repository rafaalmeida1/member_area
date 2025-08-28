import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, UserPlus, Mail, Users, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import './PatientSelector.css';

interface Patient {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  invitedAt?: string;
}

interface PatientSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedPatientIds: number[]) => void;
  initialSelectedIds?: number[];
  title?: string;
}

export function PatientSelector({
  isOpen,
  onClose,
  onSave,
  initialSelectedIds = [],
  title = "Selecionar Pacientes"
}: PatientSelectorProps) {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Carregar pacientes
  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getPatientsList();
      setPatients(response);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível carregar a lista de pacientes.";
      setError(errorMessage);
      toast({
        title: "Erro ao carregar pacientes",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar pacientes por pesquisa
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle seleção de paciente
  const togglePatient = (patientId: number) => {
    setSelectedIds(prev => 
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  // Selecionar todos
  const selectAll = () => {
    setSelectedIds(filteredPatients.map(p => p.id));
  };

  // Desmarcar todos
  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Enviar convite
  const sendInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e email do paciente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInviting(true);
      await apiService.createInvite({
        email: inviteEmail,
        name: inviteName
      });
      
      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${inviteName} (${inviteEmail})`,
      });
      
      setInviteEmail('');
      setInviteName('');
      setShowInviteForm(false);
      loadPatients(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro ao enviar convite",
        description: "Não foi possível enviar o convite.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Salvar seleção
  const handleSave = () => {
    onSave(selectedIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Selecione os pacientes que terão acesso a este módulo
          </DialogDescription>
        </DialogHeader>

        <div className="selector-content">
          {/* Barra de pesquisa */}
          <div className="search-section">
            <div className="search-input-container">
              <Search className="search-icon" />
              <Input
                placeholder="Pesquisar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="invite-button"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar Novo
            </Button>
          </div>

          {/* Formulário de convite */}
          {showInviteForm && (
            <Card className="invite-form">
              <CardHeader>
                <CardTitle className="text-lg">Convidar Novo Paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="form-label">Nome</label>
                  <Input
                    placeholder="Nome do paciente"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                    disabled={isInviting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={sendInvite}
                    disabled={isInviting || !inviteEmail || !inviteName}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {isInviting ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações de seleção */}
          <div className="selection-actions">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Selecionar Todos
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Desmarcar Todos
            </Button>
            <Badge variant="secondary">
              {selectedIds.length} selecionado{selectedIds.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Lista de pacientes */}
          <div className="patients-list">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Carregando pacientes...</span>
              </div>
            ) : error ? (
              <div className="empty-state">
                <Users className="empty-icon" />
                <span>Erro ao carregar pacientes</span>
                <p className="text-sm text-red-500 mt-2">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadPatients}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state">
                <Users className="empty-icon" />
                <span>
                  {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                </span>
              </div>
            ) : (
              filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className={`patient-item ${selectedIds.includes(patient.id) ? 'selected' : ''}`}
                  onClick={() => togglePatient(patient.id)}
                >
                  <Checkbox
                    checked={selectedIds.includes(patient.id)}
                    onChange={() => togglePatient(patient.id)}
                  />
                  <div className="patient-info">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-email">{patient.email}</div>
                    {patient.invitedAt && (
                      <Badge variant="outline" className="invite-badge">
                        Convidado em {new Date(patient.invitedAt).toLocaleDateString('pt-BR')}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Seleção ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 