import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ExternalLink, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem';
import { LoadingState } from '@/components/LoadingState';
import { publicLinksService } from '@/services/publicLinksService';
import { LinkResponse, LinkRequest, LinkType } from '@/types/publicLinks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { Layout } from '@/components/Layout';
import { analyticsService } from '@/services/analyticsService';
import { PageAnalytics } from '@/types/analytics';

const linkSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim(),
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  url: z.string()
    .min(1, 'URL é obrigatória')
    .refine((url) => {
      // Validação customizada baseada no tipo de link
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^[+]?[1-9][\d]{0,15}$/;
      const whatsappPattern = /^[+]?[1-9][\d]{0,15}$/;
      
      // Para email, validar formato de email
      if (url.includes('@')) {
        return emailPattern.test(url);
      }
      
      // Para telefone/whatsapp (apenas números)
      if (/^[+]?[\d\s-()]+$/.test(url)) {
        return whatsappPattern.test(url.replace(/[\s-()]/g, ''));
      }
      
      // Para URLs normais
      return urlPattern.test(url) || url.startsWith('http://') || url.startsWith('https://');
    }, 'URL inválida. Verifique o formato.')
    .transform((url) => {
      // Normalizar URL se necessário
      if (url.includes('@')) return url; // Email
      if (/^[+]?[\d\s-()]+$/.test(url)) return url.replace(/[\s-()]/g, ''); // Telefone
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    }),
  linkType: z.enum(['SOCIAL_MEDIA', 'WEBSITE', 'WHATSAPP', 'EMAIL', 'PHONE', 'YOUTUBE', 'LINKEDIN', 'FACEBOOK', 'TIKTOK', 'CUSTOM'] as const, {
    errorMap: () => ({ message: 'Selecione um tipo de link válido' })
  }),
  icon: z.string()
    .max(255, 'Ícone deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),
  whatsappMessage: z.string()
    .max(1000, 'Mensagem do WhatsApp deve ter no máximo 1000 caracteres')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
}).refine((data) => {
  // Validação condicional: WhatsApp deve ter número válido
  if (data.linkType === 'WHATSAPP') {
    const phonePattern = /^[+]?[1-9][\d]{0,15}$/;
    return phonePattern.test(data.url.replace(/[\s-()]/g, ''));
  }
  return true;
}, {
  message: 'Para WhatsApp, insira um número válido (ex: 5511999999999)',
  path: ['url']
}).refine((data) => {
  // Validação condicional: Email deve ter formato válido
  if (data.linkType === 'EMAIL') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(data.url);
  }
  return true;
}, {
  message: 'Para email, insira um endereço válido (ex: seu@email.com)',
  path: ['url']
}).refine((data) => {
  // Validação condicional: Telefone deve ter formato válido
  if (data.linkType === 'PHONE') {
    const phonePattern = /^[+]?[1-9][\d]{0,15}$/;
    return phonePattern.test(data.url.replace(/[\s-()]/g, ''));
  }
  return true;
}, {
  message: 'Para telefone, insira um número válido (ex: 11999999999)',
  path: ['url']
});

type LinkFormData = z.infer<typeof linkSchema>;

const MyLinks: React.FC = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<LinkResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [professionalName, setProfessionalName] = useState('');
  const [analytics, setAnalytics] = useState<PageAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      isActive: true,
    }
  });

  const watchLinkType = watch('linkType');

  useEffect(() => {
    loadLinks();
    loadProfessionalProfile();
  }, []);

  const loadProfessionalProfile = async () => {
    const data = await apiService.getProfessionalProfile();
    setProfessionalName(data.name);
    setProfessionalName(data.name || '');
  };

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await publicLinksService.getAllLinks();
      setLinks(data);
    } catch (error: unknown) {
      console.error('Erro ao carregar links:', error);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        // Redirecionar para login se necessário
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (axiosError.response?.status === 403) {
        toast.error('Você não tem permissão para acessar os links.');
      } else if (axiosError.response?.status === 404) {
        toast.error('Perfil profissional não encontrado.');
      } else if (axiosError.response?.status >= 500) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        toast.error('Erro inesperado ao carregar links. Recarregue a página.');
      }
      
      // Definir estado vazio em caso de erro
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LinkFormData) => {
    try {
      // Validação adicional antes do envio
      if (!data.title.trim()) {
        toast.error('Título é obrigatório');
        return;
      }

      if (!data.url.trim()) {
        toast.error('URL é obrigatória');
        return;
      }

      // Validar limite de links (máximo 50 por profissional)
      if (!editingLink && links.length >= 50) {
        toast.error('Você atingiu o limite máximo de 50 links');
        return;
      }

      const linkData: LinkRequest = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        url: data.url.trim(),
        linkType: data.linkType,
        whatsappMessage: data.whatsappMessage?.trim() || undefined,
        icon: data.icon?.trim() || undefined,
        displayOrder: editingLink?.displayOrder || links.length + 1,
        isActive: data.isActive,
      };

      if (editingLink) {
        const updatedLink = await publicLinksService.updateLink(editingLink.id, linkData);
        setLinks(links.map(link => link.id === editingLink.id ? updatedLink : link));
        toast.success('Link atualizado com sucesso!');
      } else {
        const newLink = await publicLinksService.createLink(linkData);
        setLinks([...links, newLink]);
        toast.success('Link criado com sucesso!');
      }

      handleCloseDialog();
    } catch (error: unknown) {
      console.error('Erro ao salvar link:', error);
      
      // Tratamento específico de erros
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response?.data?.message || 'Dados inválidos';
        if (errorMessage.includes('título')) {
          toast.error('Título inválido. Verifique se não está vazio ou muito longo.');
        } else if (errorMessage.includes('URL') || errorMessage.includes('url')) {
          toast.error('URL inválida. Verifique o formato da URL.');
        } else if (errorMessage.includes('tipo')) {
          toast.error('Tipo de link inválido.');
        } else {
          toast.error(`Erro de validação: ${errorMessage}`);
        }
      } else if (axiosError.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (axiosError.response?.status === 403) {
        toast.error('Você não tem permissão para realizar esta ação.');
      } else if (axiosError.response?.status === 404) {
        toast.error('Link não encontrado.');
      } else if (axiosError.response?.status === 409) {
        toast.error('Já existe um link com este título.');
      } else if (axiosError.response?.status === 422) {
        toast.error('Dados não processáveis. Verifique as informações.');
      } else if (axiosError.response?.status >= 500) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else {
        toast.error('Erro inesperado ao salvar link. Tente novamente.');
      }
    }
  };

  const handleEdit = (link: LinkResponse) => {
    setEditingLink(link);
    reset({
      title: link.title,
      description: link.description || '',
      url: link.url,
      linkType: link.linkType,
      icon: link.icon || '',
      whatsappMessage: link.whatsappMessage || '',
      isActive: link.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (linkId: number) => {
    if (!confirm('Tem certeza que deseja excluir este link? Esta ação não pode ser desfeita.')) return;

    try {
      await publicLinksService.deleteLink(linkId);
      setLinks(links.filter(link => link.id !== linkId));
      toast.success('Link excluído com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao excluir link:', error);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (axiosError.response?.status === 403) {
        toast.error('Você não tem permissão para excluir este link.');
      } else if (axiosError.response?.status === 404) {
        toast.error('Link não encontrado ou já foi excluído.');
        // Remover da lista local se não existe mais
        setLinks(links.filter(link => link.id !== linkId));
      } else if (axiosError.response?.status >= 500) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else {
        toast.error('Erro inesperado ao excluir link. Tente novamente.');
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLink(null);
    reset({
      title: '',
      description: '',
      url: '',
      linkType: 'WEBSITE',
      icon: '',
      whatsappMessage: '',
      isActive: true,
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex(link => link.id === Number(active.id));
    const newIndex = links.findIndex(link => link.id === Number(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      toast.error('Erro ao identificar posição dos links');
      return;
    }

    const originalLinks = [...links];
    const newLinks = arrayMove(links, oldIndex, newIndex);
    
    // Atualizar UI otimisticamente
    setLinks(newLinks);

    try {
      await publicLinksService.reorderLinks({
        linkIds: newLinks.map(link => link.id)
      });
      toast.success('Ordem dos links atualizada!');
    } catch (error: unknown) {
      console.error('Erro ao reordenar links:', error);
      
      // Reverter a mudança em caso de erro
      setLinks(originalLinks);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (axiosError.response?.status === 403) {
        toast.error('Você não tem permissão para reordenar links.');
      } else if (axiosError.response?.status === 400) {
        toast.error('Dados inválidos para reordenação.');
      } else if (axiosError.response?.status >= 500) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else {
        toast.error('Erro ao reordenar links. Ordem restaurada.');
      }
    }
  };

  const getPublicUrl = () => {
    if (!user?.id) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/links/${user.id}`;
  };

  const copyPublicUrl = () => {
    const url = getPublicUrl();
    navigator.clipboard.writeText(url);
    toast.success('URL copiada para a área de transferência!');
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await analyticsService.getPageAnalytics();
      setAnalytics(data);
    } catch (error: unknown) {
      console.error('Erro ao carregar analytics:', error);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else if (axiosError.response?.status === 403) {
        toast.error('Você não tem permissão para ver os analytics.');
      } else if (axiosError.response?.status >= 500) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast.error('Erro de conexão. Verifique sua internet.');
      } else {
        toast.error('Erro inesperado ao carregar analytics.');
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingState 
        loading={true} 
        loadingText="Carregando seus links..." 
        className="min-h-[400px]" 
      />
    );
  }

  return (
    <Layout
      title="Meus Links"
    >
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Links</h1>
          <p className="text-gray-600 mt-2">Gerencie seus links públicos</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyPublicUrl}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Copiar URL Pública
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingLink(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Link
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingLink ? 'Editar Link' : 'Adicionar Link'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título * <span className="text-xs text-gray-500">(máx. 100 caracteres)</span></Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Ex: Meu Instagram"
                    maxLength={100}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Nome que aparecerá no seu link</span>
                    <span>{watch('title')?.length || 0}/100</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição <span className="text-xs text-gray-500">(opcional, máx. 500 caracteres)</span></Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Descrição opcional do link"
                    rows={2}
                    maxLength={500}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Texto que aparecerá abaixo do título</span>
                    <span>{watch('description')?.length || 0}/500</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="linkType">Tipo do Link *</Label>
                  <Select 
                    value={watchLinkType} 
                    onValueChange={(value) => setValue('linkType', value as LinkType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEBSITE">Site/Website</SelectItem>
                      <SelectItem value="SOCIAL_MEDIA">Rede Social</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PHONE">Telefone</SelectItem>
                      <SelectItem value="YOUTUBE">YouTube</SelectItem>
                      <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                      <SelectItem value="FACEBOOK">Facebook</SelectItem>
                      <SelectItem value="TIKTOK">TikTok</SelectItem>
                      <SelectItem value="CUSTOM">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    {...register('url')}
                    placeholder={
                      watchLinkType === 'WHATSAPP' ? '5511999999999' :
                      watchLinkType === 'EMAIL' ? 'seu@email.com' :
                      watchLinkType === 'PHONE' ? '11999999999' :
                      'https://exemplo.com'
                    }
                    className={errors.url ? 'border-red-500' : ''}
                  />
                  {errors.url && (
                    <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
                  )}
                  
                  {/* Dicas de ajuda baseadas no tipo de link */}
                  {watchLinkType === 'WHATSAPP' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: código do país + DDD + número (ex: 5511999999999)
                    </p>
                  )}
                  {watchLinkType === 'EMAIL' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: usuario@dominio.com
                    </p>
                  )}
                  {watchLinkType === 'PHONE' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: DDD + número (ex: 11999999999)
                    </p>
                  )}
                  {(watchLinkType === 'WEBSITE' || watchLinkType === 'SOCIAL_MEDIA' || watchLinkType === 'CUSTOM') && (
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: https://seusite.com (https:// será adicionado automaticamente)
                    </p>
                  )}
                </div>

                {watchLinkType === 'WHATSAPP' && (
                  <div>
                    <Label htmlFor="whatsappMessage">Mensagem Padrão <span className="text-xs text-gray-500">(opcional, máx. 1000 caracteres)</span></Label>
                    <Textarea
                      id="whatsappMessage"
                      {...register('whatsappMessage')}
                      placeholder="Olá! Vim através do seu link..."
                      rows={3}
                      maxLength={1000}
                      className={errors.whatsappMessage ? 'border-red-500' : ''}
                    />
                    {errors.whatsappMessage && (
                      <p className="text-sm text-red-600 mt-1">{errors.whatsappMessage.message}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mensagem que será enviada automaticamente</span>
                      <span>{watch('whatsappMessage')?.length || 0}/1000</span>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="icon">Ícone <span className="text-xs text-gray-500">(opcional, máx. 255 caracteres)</span></Label>
                  <Input
                    id="icon"
                    {...register('icon')}
                    placeholder="Ex: instagram, ou URL do ícone"
                    maxLength={255}
                    className={errors.icon ? 'border-red-500' : ''}
                  />
                  {errors.icon && (
                    <p className="text-sm text-red-600 mt-1">{errors.icon.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Nome do ícone ou URL personalizada (deixe vazio para usar ícone padrão)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Link ativo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="links" className="w-full">
        <TabsList>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="links" className="space-y-4">
          {/* URL Pública */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sua Página Pública</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  value={getPublicUrl()}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" onClick={copyPublicUrl}>
                  Copiar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(getPublicUrl(), '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Links */}
          {links.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">Nenhum link cadastrado ainda.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar seu primeiro link
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={links.map(link => link.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {links.map((link) => (
                    <SortableItem key={link.id} id={link.id}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{link.title}</h3>
                                <Badge variant={link.isActive ? "default" : "secondary"}>
                                  {link.isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                                <Badge variant="outline">
                                  {link.clickCount} cliques
                                </Badge>
                              </div>
                              
                              {link.description && (
                                <p className="text-sm text-gray-600 truncate">
                                  {link.description}
                                </p>
                              )}
                              
                              <p className="text-xs text-gray-500 truncate">
                                {link.url}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(link)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(link.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          {analyticsLoading ? (
            <LoadingState 
              loading={true} 
              loadingText="Carregando analytics..." 
              className="min-h-[300px]" 
            />
          ) : analytics ? (
            <div className="space-y-6">
              {/* Resumo Geral */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total de Visualizações</p>
                        <p className="text-2xl font-bold">{analytics.totalViews}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <ExternalLink className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total de Cliques</p>
                        <p className="text-2xl font-bold">{analytics.totalClicks}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Taxa de Clique</p>
                        <p className="text-2xl font-bold">
                          {analytics.totalViews > 0 ? ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Visualizações Únicas</p>
                        <p className="text-2xl font-bold">{analytics.uniqueViews}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Links Mais Clicados */}
              <Card>
                <CardHeader>
                  <CardTitle>Links Mais Clicados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topLinks.slice(0, 5).map((linkStat, index) => {
                      const link = links.find(l => l.id === linkStat.linkId);
                      return (
                        <div key={linkStat.linkId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs rounded-full mr-3">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{link?.title || 'Link não encontrado'}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{link?.url}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{linkStat.totalClicks}</p>
                            <p className="text-sm text-gray-500">cliques</p>
                          </div>
                        </div>
                      );
                    })}
                    {analytics.topLinks.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Nenhum clique registrado ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Visualizações por Data */}
              {analytics.viewsByDate && analytics.viewsByDate.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Visualizações dos Últimos 7 Dias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.viewsByDate.slice(-7).map((dayData) => (
                        <div key={dayData.date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{new Date(dayData.date).toLocaleDateString('pt-BR')}</span>
                          <span className="font-bold">{dayData.views} visualizações</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Links por Cliques */}
              {analytics.topLinks && analytics.topLinks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance por Link</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.topLinks.map((linkData) => {
                        const link = links.find(l => l.id === linkData.linkId);
                        return (
                          <div key={linkData.linkId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium truncate">{link?.title || 'Link não encontrado'}</span>
                            <span className="font-bold">{linkData.totalClicks} cliques</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botão para Recarregar */}
              <div className="text-center">
                <Button onClick={loadAnalytics} variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Atualizar Analytics
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Analytics dos Seus Links</h3>
                <p className="text-gray-500 mb-6">Veja estatísticas detalhadas sobre suas visualizações e cliques</p>
                <Button onClick={loadAnalytics}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Carregar Analytics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </Layout>
  );
};

export default MyLinks;
