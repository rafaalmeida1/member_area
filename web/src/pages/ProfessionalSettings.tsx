import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingWrapper, LoadingSpinner } from '@/components/LoadingSpinner';
import { FileUpload } from '@/components/FileUpload';
import { BannerPreview } from '@/components/BannerPreview';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { apiService, ProfessionalProfile, UpdateProfessionalProfileRequest } from '@/services/api';
import { ArrowLeft, Save, Plus, X, Camera, Image } from 'lucide-react';

interface ProfessionalSettingsProps {
  onNavigateToHome: () => void;
  onNavigateToModules: () => void;
  onNavigateToInvites: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onNavigateToPatientManagement: () => void;
  professionalName?: string;
}

export function ProfessionalSettings({ 
  onNavigateToHome,
  onNavigateToModules,
  onNavigateToInvites,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToPatientManagement,
  professionalName
}: ProfessionalSettingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    image: '',
    backgroundImage: '',
    specialties: [] as string[]
  });
  
  const [newSpecialty, setNewSpecialty] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await apiService.getProfessionalProfile();
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          title: profileData.title || '',
          bio: profileData.bio || '',
          image: profileData.image || '',
          backgroundImage: profileData.backgroundImage || '',
          specialties: profileData.specialties || []
        });
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: error instanceof Error ? error.message : "Erro inesperado",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  // Atualizar campos do formulário
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Adicionar especialidade
  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  // Remover especialidade
  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  // Salvar alterações
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updateData: UpdateProfessionalProfileRequest = {
        name: formData.name,
        title: formData.title,
        bio: formData.bio || undefined,
        image: formData.image || undefined,
        backgroundImage: formData.backgroundImage || undefined,
        specialties: formData.specialties.length > 0 ? formData.specialties : undefined
      };

      const updatedProfile = await apiService.updateProfessionalProfile(updateData);
      setProfile(updatedProfile);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Upload de imagem de perfil
  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setShowImageUpload(false);
    toast({
      title: "Imagem enviada!",
      description: "Sua foto de perfil foi atualizada.",
    });
  };

  // Upload de imagem de fundo
  const handleBackgroundUpload = (url: string) => {
    setFormData(prev => ({ ...prev, backgroundImage: url }));
    setShowBackgroundUpload(false);
    toast({
      title: "Imagem de fundo enviada!",
      description: "Sua imagem de fundo foi atualizada.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Layout
      title="Configurações do Perfil"
      onNavigateToHome={onNavigateToHome}
      onNavigateToModules={onNavigateToModules}
      onNavigateToInvites={onNavigateToInvites}
      onNavigateToProfile={onNavigateToProfile}
      onNavigateToSettings={onNavigateToSettings}
      onNavigateToPatientManagement={onNavigateToPatientManagement}
      professionalName={professionalName}
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Atualize suas informações principais que aparecerão no seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Título Profissional</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Nutricionista Clínica"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Conte um pouco sobre sua experiência e especialidades..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens do Perfil</CardTitle>
              <CardDescription>
                Personalize as imagens que aparecem no seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Foto de Perfil */}
              <div className="space-y-4">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  {formData.image && (
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                      <img 
                        src={formData.image} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowImageUpload(!showImageUpload)}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {formData.image ? 'Alterar Foto' : 'Adicionar Foto'}
                    </Button>
                    {formData.image && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInputChange('image', '')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {showImageUpload && (
                  <div className="border rounded-lg p-4">
                    <FileUpload
                      type="image"
                      field="image"
                      onFileSelect={handleImageUpload}
                      setFormData={setFormData}
                      formData={formData}
                      specifications={{
                        title: "Foto de Perfil",
                        description: "Esta imagem será exibida como sua foto de perfil profissional",
                        dimensions: "400x400 pixels (quadrada)",
                        format: "JPG, PNG, WebP",
                        maxSize: "5MB",
                        tips: [
                          "Use uma foto profissional e de boa qualidade",
                          "A imagem será cortada automaticamente em formato quadrado",
                          "Evite imagens muito escuras ou com muitos detalhes pequenos",
                          "Recomendamos fundo neutro ou profissional"
                        ]
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Imagem de Fundo */}
              <div className="space-y-4">
                <Label>Imagem de Fundo do Banner</Label>
                <div className="space-y-2">
                  {formData.backgroundImage && (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={formData.backgroundImage} 
                        alt="Imagem de fundo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowBackgroundUpload(!showBackgroundUpload)}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      {formData.backgroundImage ? 'Alterar Fundo' : 'Adicionar Fundo'}
                    </Button>
                    {formData.backgroundImage && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInputChange('backgroundImage', '')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {showBackgroundUpload && (
                  <div className="border rounded-lg p-4">
                    <FileUpload
                      type="image"
                      field="backgroundImage"
                      onFileSelect={handleBackgroundUpload}
                      setFormData={setFormData}
                      formData={formData}
                      specifications={{
                        title: "Imagem de Fundo do Banner",
                        description: "Esta imagem será usada como fundo do banner principal na tela dos pacientes",
                        dimensions: "1920x640 pixels (proporção 3:1)",
                        format: "JPG, PNG, WebP",
                        maxSize: "10MB",
                        tips: [
                          "Use uma imagem de alta qualidade e resolução",
                          "A imagem será cortada automaticamente para caber no banner",
                          "Evite textos ou elementos importantes nas bordas",
                          "Recomendamos imagens com boa luminosidade",
                          "A imagem terá um overlay escuro aplicado automaticamente"
                        ]
                      }}
                    />
                  </div>
                )}

                {/* Preview do Banner */}
                {formData.backgroundImage && (
                  <BannerPreview 
                    imageUrl={formData.backgroundImage}
                    title="Como aparecerá no banner"
                    description="Preview das dimensões reais do banner na tela principal"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Especialidades */}
          <Card>
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
              <CardDescription>
                Adicione suas áreas de especialização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Lista de especialidades */}
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
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
              
              {/* Adicionar nova especialidade */}
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Ex: Nutrição Esportiva"
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                />
                <Button onClick={addSpecialty} disabled={!newSpecialty.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <LoadingSpinner className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}