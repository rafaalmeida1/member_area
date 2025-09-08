import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, User, Settings, Mail, Phone, Calendar } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { BannerPreview } from '@/components/BannerPreview';
import { apiService } from '@/services/api';
import { ModernLayout } from '@/components/ModernLayout';
import './Profile.css';

interface ProfileProps {
  onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate || ''
  });

  const [professionalData, setProfessionalData] = useState({
    name: user?.name || '',
    title: user?.professionalProfile?.title || '',
    bio: user?.professionalProfile?.bio || '',
    image: user?.professionalProfile?.image || '',

    specialties: user?.professionalProfile?.specialties || []
  });

  const handleInputChange = (field: keyof typeof profileData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleProfessionalChange = (field: keyof typeof professionalData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfessionalData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await apiService.updateUser({
        name: profileData.name,
        phone: profileData.phone,
        birthDate: profileData.birthDate
      });
      
      await refreshUser();
      toast({
        title: "Perfil atualizado!",
        description: "Seus dados pessoais foram salvos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfessional = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        name: professionalData.name,
        title: professionalData.title,
        bio: professionalData.bio || undefined,
        image: professionalData.image || undefined,
    
        specialties: professionalData.specialties.length > 0 ? professionalData.specialties : undefined
      };

      await apiService.updateProfessionalProfile(updateData);
      await refreshUser();
      
      toast({
        title: "Dados salvos!",
        description: "Seus dados profissionais foram atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro ao atualizar dados profissionais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (imageUrl: string | any) => {
    if (typeof imageUrl === 'object' && imageUrl.url) {
      setProfessionalData(prev => ({ 
        ...prev, 
        image: imageUrl.url,

      }));
    } else {
      setProfessionalData(prev => ({ 
        ...prev, 
        image: imageUrl,

      }));
    }
  };

  return (
    <ModernLayout
      title="Minha Conta"
      showSidebar={false}
      showBackButton={true}
      onBack={onBack}
    >
      <div className="profile-content">
        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Dados Pessoais
          </button>
          <button
            className={`tab-button ${activeTab === 'professional' ? 'active' : ''}`}
            onClick={() => setActiveTab('professional')}
          >
            <Settings size={18} />
            Dados Profissionais
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-tab-content">
            <div className="profile-card">
              <h2 className="card-title">Dados Pessoais</h2>
              
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
                    value={profileData.email}
                    onChange={handleInputChange('email')}
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
                  className="save-button"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  <Save size={18} />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <div className="profile-tab-content">
            <div className="profile-card">
              <h2 className="card-title">Dados Profissionais</h2>
              
              <div className="form-group">
                <label className="form-label">Nome Profissional</label>
                <div className="input-container">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    value={professionalData.name}
                    onChange={handleProfessionalChange('name')}
                    className="form-input"
                    placeholder="Seu nome profissional"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Título</label>
                <div className="input-container">
                  <Settings className="input-icon" size={18} />
                  <input
                    type="text"
                    value={professionalData.title}
                    onChange={handleProfessionalChange('title')}
                    className="form-input"
                    placeholder="Ex: Nutricionista Especialista"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Biografia</label>
                <textarea
                  value={professionalData.bio}
                  onChange={handleProfessionalChange('bio')}
                  className="form-textarea"
                  placeholder="Conte um pouco sobre você e sua experiência..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner de Fundo</label>
                <BannerPreview
                  imageUrl={professionalData.image}
                />
              </div>

              <div className="form-actions">
                <button
                  className="save-button"
                  onClick={handleSaveProfessional}
                  disabled={isLoading}
                >
                  <Save size={18} />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}