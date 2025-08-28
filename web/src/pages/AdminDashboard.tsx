import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/FileUpload';
import { LoadingWrapper, InlineLoading } from '@/components/LoadingSpinner';
import { DraggableContentList } from '@/components/DraggableContentList';
import { DraggableModuleList } from '@/components/DraggableModuleList';
import { Layout } from '@/components/Layout';
import { PatientSelector } from '@/components/PatientSelector';
import { ArrowLeft, Plus, FileText, Video, Volume2, Save, Trash2, User, Settings, LogOut, Mail, UserCog, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/utils';
import { apiService, Module, ModuleDetail } from '@/services/api';

interface AdminDashboardProps {
  professionalName?: string;
}

export function AdminDashboard({ professionalName }: AdminDashboardProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [editingModule, setEditingModule] = useState<ModuleDetail | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    category: '',
    visibility: 'GENERAL' as 'GENERAL' | 'SPECIFIC'
  });

  const [contentBlocks, setContentBlocks] = useState<Array<{
    id: string;
    type: 'TEXT' | 'VIDEO' | 'AUDIO';
    content: string;
    order: number;
  }>>([]);

  // Abrir seletor imediatamente ao escolher SPECIFIC
  useEffect(() => {
    if (formData.visibility === 'SPECIFIC' && !showPatientSelector) {
      setShowPatientSelector(true);
    }
  }, [formData.visibility]);

  const loadModules = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getModules();
      setModules(response.content);
    } catch (error) {
      const parsed = parseApiError(error);
      toast({
        title: parsed.title,
        description: parsed.description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadCategories = useCallback(async () => {
    try {
      const apiCategories = await apiService.getCategories();
      setCategories(apiCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadModules();
    loadCategories();
  }, [loadModules, loadCategories]);

  const resetForm = () => {
    setFormData({ title: '', description: '', coverImage: '', category: '', visibility: 'GENERAL' });
    setContentBlocks([]);
    setSelectedPatientIds([]);
    setEditingModule(null);
    setIsCreating(false);
  };

  const handleCreateModule = () => {
    setIsCreating(true);
    setFormData({ title: '', description: '', coverImage: '', category: '', visibility: 'GENERAL' });
    setContentBlocks([{
      id: Date.now().toString(),
      type: 'TEXT',
      content: '',
      order: 1
    }]);
  };

  const handleEditModule = async (module: Module) => {
    try {
      setIsLoading(true);
      const moduleDetail = await apiService.getModuleById(module.id);
      setEditingModule(moduleDetail);
      setIsCreating(true);
      setFormData({
        title: moduleDetail.title,
        description: moduleDetail.description,
        coverImage: moduleDetail.coverImage || '',
        category: moduleDetail.category,
        visibility: moduleDetail.visibility || 'GENERAL'
      });
      
      // Garantir que os conteúdos tenham índices válidos
      const sortedContent = [...moduleDetail.content].sort((a, b) => a.order - b.order);
      const contentBlocksWithValidIndexes = sortedContent.map((c, index) => ({
        id: c.id,
        type: c.type,
        content: c.content,
        order: index + 1 // Garantir índices sequenciais
      }));
      
      setContentBlocks(contentBlocksWithValidIndexes);
      
    } catch (error) {
      toast({
        title: "Erro ao carregar módulo",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentBlocksChange = (blocks: Array<{
    id: string;
    type: 'TEXT' | 'VIDEO' | 'AUDIO';
    content: string;
    order: number;
  }>) => {
    setContentBlocks(blocks);
  };

  const handleSaveModule = async () => {
    if (!formData.title || !formData.description || contentBlocks.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validar se pacientes foram selecionados quando a visibilidade for específica
    if (formData.visibility === 'SPECIFIC' && selectedPatientIds.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um paciente para visibilidade específica",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Filtrar blocos vazios e garantir índices sequenciais
      const validContentBlocks = contentBlocks
        .filter(block => block.content.trim() !== '')
        .map((block, index) => ({
          type: block.type,
          content: block.content.trim(),
          order: index + 1 // Garantir índices sequenciais
        }));

      // Validação adicional
      if (validContentBlocks.length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um conteúdo ao módulo",
          variant: "destructive"
        });
        return;
      }

      // Verificar se há índices duplicados ou inválidos
      const orderIndexes = validContentBlocks.map(block => block.order);
      const uniqueIndexes = new Set(orderIndexes);
      
      if (orderIndexes.length !== uniqueIndexes.size) {
        console.error('Índices duplicados detectados:', orderIndexes);
        toast({
          title: "Erro",
          description: "Erro na ordenação dos conteúdos. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Verificar se todos os índices são números positivos e sequenciais
      const expectedIndexes = Array.from({ length: validContentBlocks.length }, (_, i) => i + 1);
      const hasValidIndexes = orderIndexes.every((index, i) => index === expectedIndexes[i]);
      
      if (!hasValidIndexes) {
        console.error('Índices inválidos detectados:', orderIndexes, 'Esperado:', expectedIndexes);
        toast({
          title: "Erro",
          description: "Erro na ordenação dos conteúdos. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      const moduleData = {
        title: formData.title,
        description: formData.description,
        coverImage: formData.coverImage || undefined,
        category: formData.category,
        visibility: formData.visibility,
        content: validContentBlocks,
        ...(formData.visibility === 'SPECIFIC' && { allowedPatientIds: selectedPatientIds })
      };

      if (editingModule) {
        await apiService.updateModule(editingModule.id, moduleData);
        toast({
          title: "Sucesso",
          description: "Módulo atualizado com sucesso!"
        });
      } else {
        await apiService.createModule(moduleData);
        toast({
          title: "Sucesso",
          description: "Módulo criado com sucesso!"
        });
      }

      resetForm();
      loadModules();
      loadCategories(); // Recarregar categorias caso uma nova tenha sido criada
    } catch (error) {
      const parsed = parseApiError(error);
      toast({
        title: parsed.title,
        description: parsed.description,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    try {
      setIsDeleting(id);
      await apiService.deleteModule(id);
      toast({
        title: "Sucesso",
        description: "Módulo excluído com sucesso!"
      });
      loadModules();
    } catch (error) {
      const parsed = parseApiError(error);
      toast({
        title: parsed.title,
        description: parsed.description,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };



  if (isCreating) {
    return (
      <Layout
        title={editingModule ? 'Editar Módulo' : 'Criar Novo Módulo'}
        showSidebar={true}
        showBackButton={true}
        onBack={resetForm}
      >

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl">
                {editingModule ? 'Editar Módulo' : 'Criar Novo Módulo'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do módulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      if (value === 'new') {
                        setFormData(prev => ({ ...prev, category: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, category: value }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione ou digite uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Nova categoria</SelectItem>
                    </SelectContent>
                  </Select>
                  {(!formData.category || !categories.includes(formData.category)) && (
                    <Input
                      placeholder="Digite o nome da nova categoria"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do módulo"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                <FileUpload
                  type="image"
                  currentUrl={formData.coverImage}
                  field="coverImage"
                  onFileSelect={(publicUrl) => setFormData(prev => ({ ...prev, coverImage: publicUrl }))}
                  setFormData={setFormData}
                  formData={formData}
                  specifications={{
                    title: "Imagem de Capa do Módulo",
                    description: "Esta imagem será exibida como capa do módulo na listagem",
                    dimensions: "1200x675 pixels (proporção 16:9)",
                    format: "JPG, PNG, WebP",
                    maxSize: "8MB",
                    tips: [
                      "Use uma imagem que represente bem o conteúdo do módulo",
                      "A imagem será cortada automaticamente para caber no card",
                      "Evite textos ou elementos importantes nas bordas",
                      "Recomendamos imagens com boa luminosidade e contraste",
                      "A imagem terá um overlay escuro aplicado automaticamente"
                    ]
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilidade</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: 'GENERAL' | 'SPECIFIC') => 
                    setFormData(prev => ({ ...prev, visibility: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">Geral (todos os pacientes)</SelectItem>
                    <SelectItem value="SPECIFIC">Específico (pacientes selecionados)</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Seletor de pacientes para visibilidade específica */}
                {formData.visibility === 'SPECIFIC' && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Pacientes Selecionados</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPatientSelector(true)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Selecionar Pacientes
                      </Button>
                    </div>
                    
                    {selectedPatientIds.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {selectedPatientIds.length} paciente{selectedPatientIds.length !== 1 ? 's' : ''} selecionado{selectedPatientIds.length !== 1 ? 's' : ''}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPatientIds([])}
                          className="text-red-600 hover:text-red-700"
                        >
                          Limpar seleção
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhum paciente selecionado. Clique em "Selecionar Pacientes" para escolher.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Content Blocks */}
              <DraggableContentList
                contentBlocks={contentBlocks}
                onContentBlocksChange={handleContentBlocksChange}
                formData={formData}
                setFormData={setFormData}
              />

              <div className="flex gap-3 pt-6">
                <Button onClick={handleSaveModule} className="flex-1" disabled={isSaving}>
                  <InlineLoading loading={isSaving} loadingText={editingModule ? 'Atualizando...' : 'Criando...'}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingModule ? 'Atualizar Módulo' : 'Criar Módulo'}
                  </InlineLoading>
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal do PatientSelector */}
        <PatientSelector
          isOpen={showPatientSelector}
          onClose={() => setShowPatientSelector(false)}
          onSave={(selectedIds) => {
            setSelectedPatientIds(selectedIds);
            setShowPatientSelector(false);
          }}
          initialSelectedIds={selectedPatientIds}
          title="Selecionar Pacientes para o Módulo"
        />
      </Layout>
    );
  }

  return (
    <Layout
      title="Gerenciar Módulos"
      professionalName={professionalName}
    >

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Gerenciar Módulos</h2>
            <p className="text-muted-foreground mt-2">
              Crie e edite conteúdos para seus pacientes
            </p>
          </div>
          <Button onClick={handleCreateModule} size="lg" className="shadow-md hover:shadow-lg transition-all duration-300">
            <Plus className="w-5 h-5 mr-2" />
            Novo Módulo
          </Button>
        </div>

        {/* Modules Grid */}
        <LoadingWrapper 
          loading={isLoading} 
          loadingMessage="Carregando módulos..."
          overlay={true}
          card={true}
          size="lg"
        >
          <DraggableModuleList
            modules={modules}
            onModulesChange={setModules}
            onSaveOrder={loadModules}
            onEdit={handleEditModule}
            onDelete={handleDeleteModule}
            isProfessional={true}
            isDeleting={isDeleting}
          />

          {modules.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                Nenhum módulo criado ainda.
              </p>
              <Button onClick={handleCreateModule}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Módulo
              </Button>
            </div>
          )}
        </LoadingWrapper>
      </div>
    </Layout>
  );
}