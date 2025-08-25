import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, User, Lock, Eye, EyeOff, Mail, Phone, Calendar } from 'lucide-react';
import { apiService } from '@/services/api';
import { Layout } from '@/components/Layout';
import './Settings.css';

interface SettingsProps {
  onNavigateToHome: () => void;
  onNavigateToModules: () => void;
  onNavigateToInvites: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToPatientManagement: () => void;
  professionalName?: string;
}

export function Settings({ 
  onNavigateToHome,
  onNavigateToModules,
  onNavigateToInvites,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToPatientManagement,
  professionalName
}: SettingsProps) {
  const { user, updateUser, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        phone: user.phone || '',
        birthDate: user.birthDate || ''
      });
    }
  }, [user]);

  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleInputChange = (field: keyof typeof profileData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePasswordChange = (field: keyof typeof passwordData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.name) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = await apiService.updateUser({
        name: profileData.name,
        phone: profileData.phone || undefined,
        birthDate: profileData.birthDate || undefined,
      });
      
      updateUser(updatedUser);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(passwordData.newPassword)) {
      toast({
        title: "Senha fraca",
        description: "A nova senha deve atender aos critérios de segurança.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Limpar formulário
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      title="Minha Conta"
      onNavigateToHome={onNavigateToHome}
      onNavigateToModules={onNavigateToModules}
      onNavigateToInvites={onNavigateToInvites}
      onNavigateToProfile={onNavigateToProfile}
      onNavigateToSettings={onNavigateToSettings}
      onNavigateToPatientManagement={onNavigateToPatientManagement}
      professionalName={professionalName}
    >
      <div className="settings-content">
        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Perfil
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={18} />
            Senha
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="settings-tab-content">
            <div className="settings-card">
              <h2 className="card-title">Dados do Perfil</h2>
              
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <div className="input-container">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={handleInputChange('name')}
                      className="form-input"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <div className="input-container">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="form-input"
                      placeholder="Seu e-mail"
                      disabled
                    />
                  </div>
                  <p className="input-help">O e-mail não pode ser alterado</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <div className="input-container">
                    <Phone className="input-icon" size={18} />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={handleInputChange('phone')}
                      className="form-input"
                      placeholder="Seu telefone"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Nascimento</label>
                  <div className="input-container">
                    <Calendar className="input-icon" size={18} />
                    <input
                      type="date"
                      value={profileData.birthDate}
                      onChange={handleInputChange('birthDate')}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={isLoading}
                  >
                    <Save size={18} />
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="settings-tab-content">
            <div className="settings-card">
              <h2 className="card-title">Alterar Senha</h2>
              
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Senha Atual</label>
                  <div className="input-container">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange('currentPassword')}
                      className="form-input"
                      placeholder="Sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="password-toggle"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nova Senha</label>
                  <div className="input-container">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange('newPassword')}
                      className="form-input"
                      placeholder="Sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="password-toggle"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmar Nova Senha</label>
                  <div className="input-container">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange('confirmPassword')}
                      className="form-input"
                      placeholder="Confirme sua nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="password-requirements">
                  <h3 className="requirements-title">Requisitos da Senha:</h3>
                  <ul className="requirements-list">
                    <li className={passwordData.newPassword.length >= 8 ? 'valid' : ''}>
                      Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                      Pelo menos uma letra maiúscula
                    </li>
                    <li className={/[a-z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                      Pelo menos uma letra minúscula
                    </li>
                    <li className={/\d/.test(passwordData.newPassword) ? 'valid' : ''}>
                      Pelo menos um número
                    </li>
                    <li className={/[@$!%*?&]/.test(passwordData.newPassword) ? 'valid' : ''}>
                      Pelo menos um caractere especial (@$!%*?&)
                    </li>
                  </ul>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-button"
                    disabled={isLoading || !validatePassword(passwordData.newPassword)}
                  >
                    <Save size={18} />
                    {isLoading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}