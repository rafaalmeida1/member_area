import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FileUpload } from '@/components/FileUpload';
import { BannerPreview } from '@/components/BannerPreview';
import { ThemePreview } from '@/components/ThemePreview';
import { Layout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService, ProfessionalProfile, UpdateProfessionalProfileRequest } from '@/services/api';
import { ArrowLeft, Save, Plus, X, Camera, Image } from 'lucide-react';

interface ProfessionalSettingsProps {
  professionalName?: string;
}

export function ProfessionalSettings({ 
  professionalName
}: ProfessionalSettingsProps) {
  const { toast } = useToast();
  const { refreshTheme } = useTheme();

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
    backgroundPositionX: 50,
    backgroundPositionY: 50,
    // Cores personalizadas do tema
    themePrimaryColor: '#DBCFCB',
    themeSecondaryColor: '#D8C4A4',
    themeAccentColor: '#A67B5B',
    themeBackgroundColor: '#FFFFFF',
    themeSurfaceColor: '#FAFAFA',
    themeTextColor: '#2C2C2C',
    themeTextSecondaryColor: '#666666',
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
          backgroundPositionX: profileData.backgroundPositionX ?? 50,
          backgroundPositionY: profileData.backgroundPositionY ?? 50,
          // Cores personalizadas do tema
          themePrimaryColor: profileData.themePrimaryColor ?? '#DBCFCB',
          themeSecondaryColor: profileData.themeSecondaryColor ?? '#D8C4A4',
          themeAccentColor: profileData.themeAccentColor ?? '#A67B5B',
          themeBackgroundColor: profileData.themeBackgroundColor ?? '#FFFFFF',
          themeSurfaceColor: profileData.themeSurfaceColor ?? '#FAFAFA',
          themeTextColor: profileData.themeTextColor ?? '#2C2C2C',
          themeTextSecondaryColor: profileData.themeTextSecondaryColor ?? '#666666',
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
        backgroundPositionX: formData.backgroundPositionX,
        backgroundPositionY: formData.backgroundPositionY,
        // Cores personalizadas do tema
        themePrimaryColor: formData.themePrimaryColor,
        themeSecondaryColor: formData.themeSecondaryColor,
        themeAccentColor: formData.themeAccentColor,
        themeBackgroundColor: formData.themeBackgroundColor,
        themeSurfaceColor: formData.themeSurfaceColor,
        themeTextColor: formData.themeTextColor,
        themeTextSecondaryColor: formData.themeTextSecondaryColor,
        specialties: formData.specialties.length > 0 ? formData.specialties : undefined
      };

      const updatedProfile = await apiService.updateProfessionalProfile(updateData);
      setProfile(updatedProfile);
      
      // Recarregar o tema global após salvar
      await refreshTheme();
      
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

              {/* Imagem de Fundo */}
              <div className="space-y-4">
                <Label>Imagem de Fundo do Banner</Label>
                <div className="space-y-2">
                  {formData.backgroundImage && (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                      <div
                        className="w-full h-full bg-no-repeat bg-cover"
                        style={{
                          backgroundImage: `url(${formData.backgroundImage})`,
                          backgroundPosition: `${formData.backgroundPositionX}% ${formData.backgroundPositionY}%`
                        }}
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

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Posição Horizontal (X%)</Label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={formData.backgroundPositionX}
                          onChange={(e) => setFormData(prev => ({...prev, backgroundPositionX: Number(e.target.value)}))}
                          className="w-full"
                        />
                        <div className="text-sm text-muted-foreground mt-1">{formData.backgroundPositionX}%</div>
                      </div>
                      <div>
                        <Label>Posição Vertical (Y%)</Label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={formData.backgroundPositionY}
                          onChange={(e) => setFormData(prev => ({...prev, backgroundPositionY: Number(e.target.value)}))}
                          className="w-full"
                        />
                        <div className="text-sm text-muted-foreground mt-1">{formData.backgroundPositionY}%</div>
                      </div>
                    </div>
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

          {/* Cores Personalizadas do Tema */}
          <Card>
            <CardHeader>
              <CardTitle>Cores Personalizadas do Tema</CardTitle>
              <CardDescription>
                Personalize as cores do sistema que aparecerão para todos os usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cor Primária */}
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themePrimaryColor}
                      onChange={(e) => setFormData(prev => ({...prev, themePrimaryColor: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.themePrimaryColor}
                      onChange={(e) => setFormData(prev => ({...prev, themePrimaryColor: e.target.value}))}
                      placeholder="#DBCFCB"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Usada em botões principais e elementos de destaque</p>
                </div>

                {/* Cor Secundária */}
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themeSecondaryColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeSecondaryColor: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.themeSecondaryColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeSecondaryColor: e.target.value}))}
                      placeholder="#D8C4A4"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Usada em elementos secundários e backgrounds</p>
                </div>

                {/* Cor de Destaque */}
                <div className="space-y-2">
                  <Label>Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themeAccentColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeAccentColor: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.themeAccentColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeAccentColor: e.target.value}))}
                      placeholder="#A67B5B"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Usada em links e elementos interativos</p>
                </div>

                {/* Cor de Fundo */}
                <div className="space-y-2">
                  <Label>Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themeBackgroundColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeBackgroundColor: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.themeBackgroundColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeBackgroundColor: e.target.value}))}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Cor de fundo principal da aplicação</p>
                </div>

                {/* Cor de Superfície */}
                <div className="space-y-2">
                  <Label>Cor de Superfície</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themeSurfaceColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeSurfaceColor: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.themeSurfaceColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeSurfaceColor: e.target.value}))}
                      placeholder="#FAFAFA"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Usada em cards e elementos elevados</p>
                </div>

                {/* Cor do Texto */}
                <div className="space-y-2">
                  <Label>Cor do Texto Principal</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themeTextColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeTextColor: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.themeTextColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeTextColor: e.target.value}))}
                      placeholder="#2C2C2C"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Cor principal do texto</p>
                </div>

                {/* Cor do Texto Secundário */}
                <div className="space-y-2">
                  <Label>Cor do Texto Secundário</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themeTextSecondaryColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeTextSecondaryColor: e.target.value}))}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.themeTextSecondaryColor}
                      onChange={(e) => setFormData(prev => ({...prev, themeTextSecondaryColor: e.target.value}))}
                      placeholder="#666666"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Cor para textos secundários e descrições</p>
                </div>
              </div>

              {/* Preview do Tema */}
              <div className="mt-6">
                <ThemePreview 
                  theme={{
                    primaryColor: formData.themePrimaryColor,
                    secondaryColor: formData.themeSecondaryColor,
                    accentColor: formData.themeAccentColor,
                    backgroundColor: formData.themeBackgroundColor,
                    surfaceColor: formData.themeSurfaceColor,
                    textColor: formData.themeTextColor,
                    textSecondaryColor: formData.themeTextSecondaryColor
                  }}
                  title="Preview do Tema"
                  description="Como as cores personalizadas aparecerão no sistema"
                />
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