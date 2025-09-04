import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ExternalLink, BarChart3, Palette, Upload, Eye, MessageCircle, Phone, Mail, Instagram, Youtube, Linkedin, Facebook, Twitter, Send } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { Layout } from '@/components/Layout';
import { analyticsService } from '@/services/analyticsService';
import { PageAnalytics } from '@/types/analytics';
import { linkPageProfileService } from '@/services/linkPageProfileService';
import { LinkPageProfileRequest, LinkPageProfileResponse } from '@/types/linkPageProfile';
import { FileUpload } from '@/components/FileUpload';

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
  linkType: z.enum(['SOCIAL_MEDIA', 'WEBSITE', 'WHATSAPP', 'EMAIL', 'PHONE', 'YOUTUBE', 'LINKEDIN', 'FACEBOOK', 'TIKTOK', 'INSTAGRAM', 'TWITTER', 'TELEGRAM', 'CUSTOM'] as const, {
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
  displayAsIcon: z.boolean().default(false),
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

// Lista de ícones disponíveis
const availableIcons = [
  { value: 'instagram', label: 'Instagram', component: Instagram },
  { value: 'whatsapp', label: 'WhatsApp', component: MessageCircle },
  { value: 'facebook', label: 'Facebook', component: Facebook },
  { value: 'twitter', label: 'X (Twitter)', component: Twitter },
  { value: 'youtube', label: 'YouTube', component: Youtube },
  { value: 'linkedin', label: 'LinkedIn', component: Linkedin },
  { value: 'telegram', label: 'Telegram', component: Send },
  { value: 'tiktok', label: 'TikTok', component: null }, // Usaremos texto customizado
  { value: 'email', label: 'Email', component: Mail },
  { value: 'phone', label: 'Telefone', component: Phone },
  { value: 'website', label: 'Site/Website', component: ExternalLink },
];

// Função para renderizar ícone baseado no valor
const renderIconByValue = (iconValue: string, size = 20, className = "text-white") => {
  const iconProps = { size, className };
  
  const iconConfig = availableIcons.find(icon => icon.value === iconValue);
  if (iconConfig?.component) {
    const IconComponent = iconConfig.component;
    return <IconComponent {...iconProps} />;
  }
  
  // Casos especiais
  if (iconValue === 'tiktok') {
    return <div className={`font-bold text-xs ${className}`}>TT</div>;
  }
  
  // Fallback para ícone padrão
  return <ExternalLink {...iconProps} />;
};

// Função para renderizar ícones sociais no preview
const renderSocialIcon = (linkType: LinkType, size = 20) => {
  const iconProps = { size, className: "text-white" };
  
  switch (linkType) {
    case 'WHATSAPP':
      return <MessageCircle {...iconProps} />;
    case 'EMAIL':
      return <Mail {...iconProps} />;
    case 'PHONE':
      return <Phone {...iconProps} />;
    case 'INSTAGRAM':
      return <Instagram {...iconProps} />;
    case 'YOUTUBE':
      return <Youtube {...iconProps} />;
    case 'LINKEDIN':
      return <Linkedin {...iconProps} />;
    case 'FACEBOOK':
      return <Facebook {...iconProps} />;
    case 'TWITTER':
      return <Twitter {...iconProps} />;
    case 'TELEGRAM':
      return <Send {...iconProps} />;
    case 'TIKTOK':
      return <div className="text-white font-bold text-xs">TT</div>;
    default:
      return <ExternalLink {...iconProps} />;
  }
};


const MyLinks: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Helper para toasts de sucesso
  const showSuccessToast = (message: string) => {
    toast({
      title: "Sucesso",
      description: message,
    });
  };
  
  // Helper para toasts de erro
  const showErrorToast = (title: string, message: string) => {
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  };
  const [links, setLinks] = useState<LinkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<LinkResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [professionalName, setProfessionalName] = useState('');
  const [analytics, setAnalytics] = useState<PageAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [pageProfile, setPageProfile] = useState<LinkPageProfileResponse | null>(null);
  const [pageProfileLoading, setPageProfileLoading] = useState(false);
  const [previewData, setPreviewData] = useState<LinkPageProfileRequest | null>(null);

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

  const loadProfessionalProfile = async () => {
    try {
      const data = await apiService.getProfessionalProfile();
      setProfessionalName(data.name || '');
    } catch (error: unknown) {
      console.error('Erro ao carregar perfil profissional:', error);
      // Não bloquear a página se não conseguir carregar o perfil
      setProfessionalName('');
    }
  };

  const loadLinks = useCallback(async () => {
    try {
      console.log('MyLinks: Iniciando carregamento de links...');
      setLoading(true);
      const data = await publicLinksService.getAllLinks();
      console.log('MyLinks: Links carregados com sucesso:', data.length);
      setLinks(data);
    } catch (error: unknown) {
      console.error('MyLinks: Erro ao carregar links:', error);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast({
          title: "Sessão Expirada",
          description: "Faça login novamente.",
          variant: "destructive",
        });
      } else if (axiosError.response?.status === 403) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar os links.",
          variant: "destructive",
        });
      } else if (axiosError.response?.status === 404) {
        toast({
          title: "Perfil Não Encontrado",
          description: "Perfil profissional não encontrado.",
          variant: "destructive",
        });
      } else if (axiosError.response?.status >= 500) {
        toast({
          title: "Erro do Servidor",
          description: "Erro interno do servidor. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast({
          title: "Erro de Conexão",
          description: "Verifique sua internet e tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro Inesperado",
          description: "Erro inesperado ao carregar links. Recarregue a página.",
          variant: "destructive",
        });
      }
      
      // Definir estado vazio em caso de erro
      setLinks([]);
    } finally {
      console.log('MyLinks: Finalizando carregamento de links...');
      setLoading(false);
    }
  }, [toast]);

  const onSubmit = async (data: LinkFormData) => {
    try {
      // Validação adicional antes do envio
      if (!data.title.trim()) {
        showErrorToast('Título Obrigatório', 'O título do link é obrigatório.');
        return;
      }

      if (!data.url.trim()) {
        showErrorToast('URL Obrigatória', 'A URL do link é obrigatória.');
        return;
      }

      // Validar limite de links (máximo 50 por profissional)
      if (!editingLink && links.length >= 50) {
        showErrorToast('Limite Atingido', 'Você atingiu o limite máximo de 50 links.');
        return;
      }

      const linkData: LinkRequest = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        url: data.url.trim(),
        linkType: data.linkType,
        whatsappMessage: data.whatsappMessage?.trim() || undefined,
        icon: data.icon?.trim() || undefined,
        displayAsIcon: data.displayAsIcon,
        displayOrder: editingLink?.displayOrder || links.length + 1,
        isActive: data.isActive,
      };

      if (editingLink) {
        const updatedLink = await publicLinksService.updateLink(editingLink.id, linkData);
        setLinks(links.map(link => link.id === editingLink.id ? updatedLink : link));
        showSuccessToast('Link atualizado com sucesso!');
      } else {
        const newLink = await publicLinksService.createLink(linkData);
        setLinks([...links, newLink]);
        showSuccessToast('Link criado com sucesso!');
      }

      handleCloseDialog();
    } catch (error: unknown) {
      console.error('Erro ao salvar link:', error);
      
      // Tratamento específico de erros
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response?.data?.message || 'Dados inválidos';
        if (errorMessage.includes('título')) {
          toast({
            title: 'Título inválido',
            description: 'Título inválido. Verifique se não está vazio ou muito longo.',
            variant: 'destructive',
          }); 
        } else if (errorMessage.includes('URL') || errorMessage.includes('url')) {
          toast({
            title: 'URL inválida',
            description: 'URL inválida. Verifique o formato da URL.',
            variant: 'destructive',
          });
        } else if (errorMessage.includes('tipo')) {
          toast({
            title: 'Tipo de link inválido',
            description: 'Tipo de link inválido.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro de validação',
            description: `Err o de validação: ${errorMessage}`,
            variant: 'destructive',
          });
        }
      } else if (axiosError.response?.status === 401) {
        toast({
          title: 'Sessão expirada',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Você não tem permissão para realizar esta ação.',
          description: 'Você não tem permissão para realizar esta ação.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 404) {
        toast({
          title: 'Link não encontrado',
          description: 'Link não encontrado.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 409) {
        toast({
          title: 'Já existe um link com este título',
          description: 'Já existe um link com este título.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 422) {
        toast({
          title: 'Dados não processáveis',
          description: 'Dados não processáveis. Verifique as informações.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status >= 500) {
        toast({
          title: 'Erro interno do servidor',
          description: 'Erro interno do servidor. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast({
          title: 'Erro de conexão',
          description: 'Erro de conexão. Verifique sua internet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro inesperado ao salvar link',
          description: 'Erro inesperado ao salvar link. Tente novamente.',
          variant: 'destructive',
        });
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
      displayAsIcon: link.displayAsIcon || false,
      isActive: link.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (linkId: number) => {
    if (!confirm('Tem certeza que deseja excluir este link? Esta ação não pode ser desfeita.')) return;

    try {
      await publicLinksService.deleteLink(linkId);
      setLinks(links.filter(link => link.id !== linkId));
      showSuccessToast('Link excluído com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao excluir link:', error);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast({
          title: 'Sessão expirada',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Você não tem permissão para excluir este link',
          description: 'Você não tem permissão para excluir este link.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 404) {
        toast({
          title: 'Link não encontrado ou já foi excluído',
          description: 'Link não encontrado ou já foi excluído.',
          variant: 'destructive',
        });
        // Remover da lista local se não existe mais
        setLinks(links.filter(link => link.id !== linkId));
      } else if (axiosError.response?.status >= 500) {
        toast({
          title: 'Erro interno do servidor',
          description: 'Erro interno do servidor. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast({
          title: 'Erro de conexão',
          description: 'Erro de conexão. Verifique sua internet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro inesperado ao excluir link',
          description: 'Erro inesperado ao excluir link. Tente novamente.',
          variant: 'destructive',
        });
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
      displayAsIcon: false,
      isActive: true,
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex(link => link.id === Number(active.id));
    const newIndex = links.findIndex(link => link.id === Number(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      toast({
        title: 'Erro ao identificar posição dos links',
        description: 'Erro ao identificar posição dos links',
        variant: 'destructive',
      });
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
      showSuccessToast('Ordem dos links atualizada!');
    } catch (error: unknown) {
      console.error('Erro ao reordenar links:', error);
      
      // Reverter a mudança em caso de erro
      setLinks(originalLinks);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast({
          title: 'Sessão expirada',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Você não tem permissão para reordenar links.',
          description: 'Você não tem permissão para reordenar links.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 400) {
        toast({
          title: 'Dados inválidos para reordenação',
          description: 'Dados inválidos para reordenação.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status >= 500) {
        toast({
          title: 'Erro interno do servidor',
          description: 'Erro interno do servidor. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast({
          title: 'Erro de conexão',
          description: 'Erro de conexão. Verifique sua internet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro ao reordenar links',
          description: 'Erro ao reordenar links. Ordem restaurada.',
          variant: 'destructive',
        });
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
    showSuccessToast('URL copiada para a área de transferência!');
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
        toast({
          title: 'Sessão expirada',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Você não tem permissão para ver os analytics',
          description: 'Você não tem permissão para ver os analytics.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status >= 500) {
        toast({
          title: 'Erro interno do servidor',
          description: 'Erro interno do servidor. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast({
          title: 'Erro de conexão',
          description: 'Erro de conexão. Verifique sua internet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro inesperado ao carregar analytics',
          description: 'Erro inesperado ao carregar analytics.',
          variant: 'destructive',
        });
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadPageProfile = useCallback(async () => {
    try {
      setPageProfileLoading(true);
      const data = await linkPageProfileService.getLinkPageProfile();
      setPageProfile(data);
      setPreviewData(data);
    } catch (error: unknown) {
      console.error('Erro ao carregar configurações da página:', error);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast({
          title: 'Sessão expirada',
          description: 'Sessão expirada. Redirecionando para login...',
          variant: 'destructive',
        });
        // O interceptor já vai redirecionar
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Você não tem permissão para acessar essas configurações',
          description: 'Você não tem permissão para acessar essas configurações.',
          variant: 'destructive',
        });
      } else {
        // Para outros erros, usar configurações padrão sem mostrar erro
        console.warn('Usando configurações padrão devido ao erro:', error);
      }
      
      // Usar configurações padrão
      setPageProfile(null);
      setPreviewData(null);
    } finally {
      setPageProfileLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLinks();
    loadProfessionalProfile();
    loadPageProfile();
  }, [loadLinks, loadPageProfile]);

  const savePageProfile = async (data: LinkPageProfileRequest) => {
    try {
      const updated = await linkPageProfileService.updateLinkPageProfile(data);
      setPageProfile(updated);
      setPreviewData(updated);
      showSuccessToast('Configurações da página salvas com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao salvar configurações da página:', error);
      
      const axiosError = error as { response?: { status: number; data?: { message?: string } }; code?: string };
      if (axiosError.response?.status === 401) {
        toast({
          title: 'Sessão expirada',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive',
        })
      } else if (axiosError.response?.status === 403) {
        toast({
          title: 'Você não tem permissão para alterar essas configurações',
          description: 'Você não tem permissão para alterar essas configurações.',
          variant: 'destructive',
        });
      } else if (axiosError.response?.status >= 500) {
        toast({
          title: 'Erro interno do servidor',
          description: 'Erro interno do servidor. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
        toast({
          title: 'Erro de conexão',
          description: 'Erro de conexão. Verifique sua internet.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro inesperado ao salvar configurações',
          description: 'Erro inesperado ao salvar configurações.',
          variant: 'destructive',
        });
      }
    }
  };

  const copySiteColors = async () => {
    try {
      // Buscar as cores do tema do site principal
      const professionalProfile = await apiService.getProfessionalProfile();
      
      // Copiar as cores do site para o preview
      setPreviewData(prev => ({
        ...prev,
        pagePrimaryColor: professionalProfile.themePrimaryColor || '#3b82f6',
        pageSecondaryColor: professionalProfile.themeSecondaryColor || '#64748b',
        pageBackgroundColor: professionalProfile.themeBackgroundColor || '#ffffff',
        pageSurfaceColor: professionalProfile.themeSurfaceColor || '#f8fafc',
        pageTextPrimaryColor: professionalProfile.themeTextColor || '#1e293b',
        pageTextSecondaryColor: professionalProfile.themeTextSecondaryColor || '#64748b',
        pageBorderColor: '#e2e8f0', // Cor padrão para bordas
        pageHoverColor: '#f1f5f9', // Cor padrão para hover
      }));
      
      showSuccessToast('Cores do site copiadas com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao copiar cores do site:', error);
      showErrorToast('Erro ao Copiar Cores', 'Erro ao copiar cores do site. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <Layout title="Meus Links">
        <LoadingState 
          loading={true} 
          loadingText="Carregando seus links..." 
          className="min-h-[400px]" 
        />
      </Layout>
    );
  }

  return (
    <Layout
      title="Meus Links"
    >
    <div className="mx-auto p-6 max-w-full">
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
                      <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="PHONE">Telefone</SelectItem>
                      <SelectItem value="YOUTUBE">YouTube</SelectItem>
                      <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                      <SelectItem value="FACEBOOK">Facebook</SelectItem>
                      <SelectItem value="TIKTOK">TikTok</SelectItem>
                      <SelectItem value="TWITTER">X (Twitter)</SelectItem>
                      <SelectItem value="TELEGRAM">Telegram</SelectItem>
                      <SelectItem value="SOCIAL_MEDIA">Outra Rede Social</SelectItem>
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
                  <Label htmlFor="icon">Ícone</Label>
                  <Select 
                    value={watch('icon') || ''} 
                    onValueChange={(value) => setValue('icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ícone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ícone padrão (baseado no tipo)</SelectItem>
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            {icon.component ? (
                              <icon.component size={16} />
                            ) : (
                              <div className="w-4 h-4 flex items-center justify-center text-xs font-bold">TT</div>
                            )}
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Escolha o ícone que será exibido para este link
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="displayAsIcon"
                    checked={watch('displayAsIcon')}
                    onCheckedChange={(checked) => setValue('displayAsIcon', checked)}
                  />
                  <div>
                    <Label htmlFor="displayAsIcon">Exibir como ícone social</Label>
                    <p className="text-xs text-gray-500">
                      Se ativado, aparece no topo como ícone. Se desativado, aparece como botão/card
                    </p>
                  </div>
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
          <TabsTrigger value="customize">
            <Palette className="w-4 h-4 mr-2" />
            Personalizar
          </TabsTrigger>
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
                      {({ dragHandleProps }: { dragHandleProps?: React.RefAttributes<HTMLDivElement> & Record<string, unknown> }) => (
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div
                                {...dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-5 h-5 text-gray-400" />
                              </div>
                              
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(link);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(link.id);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
        
        <TabsContent value="customize" className="space-y-4">
          {pageProfileLoading ? (
            <LoadingState 
              loading={true} 
              loadingText="Carregando configurações..." 
              className="min-h-[300px]" 
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Painel de Configurações */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Personalizar Página de Links
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      Configure a aparência da sua página de links pública. Estas configurações são independentes do seu site principal.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Informações da Página de Links</h3>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Personalização Independente:</strong> Estas informações são específicas para sua página de links pública. 
                          Você pode usar dados diferentes do seu perfil principal do site.
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="displayName">Nome para a página de links</Label>
                        <Input
                          id="displayName"
                          value={previewData?.displayName || ''}
                          onChange={(e) => setPreviewData(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="Nome que aparecerá na sua página de links (pode ser diferente do site)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Deixe vazio para usar o nome do seu perfil principal
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="displayTitle">Título/Profissão para a página de links</Label>
                        <Input
                          id="displayTitle"
                          value={previewData?.displayTitle || ''}
                          onChange={(e) => setPreviewData(prev => ({ ...prev, displayTitle: e.target.value }))}
                          placeholder="Ex: Nutricionista Especializada em Emagrecimento"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Título específico para sua página de links (independente do site)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="displayBio">Biografia para a página de links</Label>
                        <Textarea
                          id="displayBio"
                          value={previewData?.displayBio || ''}
                          onChange={(e) => setPreviewData(prev => ({ ...prev, displayBio: e.target.value }))}
                          placeholder="Descrição específica para sua página de links..."
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Bio exclusiva para a página de links</span>
                          <span>{previewData?.displayBio?.length || 0}/500</span>
                        </div>
                      </div>
                    </div>

                    {/* Imagens */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Imagens da Página de Links</h3>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-800">
                          <strong>Imagens Exclusivas:</strong> Use imagens específicas para sua página de links, 
                          diferentes das do seu site principal se desejar.
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="displayImageUrl">Foto do Perfil para a página de links</Label>
                        <FileUpload
                          type="image"
                          currentUrl={previewData?.displayImageUrl}
                          field="displayImageUrl"
                          onFileSelect={(url) => setPreviewData(prev => ({ ...prev, displayImageUrl: url }))}
                          specifications={{
                            title: "Foto do Perfil",
                            description: "Imagem que aparecerá como foto de perfil na sua página de links",
                            dimensions: "400x400 pixels (quadrada)",
                            format: "JPG, PNG, WebP",
                            maxSize: "5MB",
                            tips: [
                              "Use uma foto clara e profissional",
                              "A imagem será cortada em formato circular",
                              "Centralize o rosto na imagem",
                              "Evite fundos muito coloridos ou distraentes"
                            ]
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Deixe vazio para usar a foto do seu perfil principal
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="backgroundImageUrl">Imagem de Fundo da página de links</Label>
                        <FileUpload
                          type="image"
                          currentUrl={previewData?.backgroundImageUrl}
                          field="backgroundImageUrl"
                          onFileSelect={(url) => setPreviewData(prev => ({ ...prev, backgroundImageUrl: url }))}
                          specifications={{
                            title: "Imagem de Fundo",
                            description: "Imagem que aparecerá como fundo da sua página de links",
                            dimensions: "1080x1920 pixels (vertical mobile)",
                            format: "JPG, PNG, WebP",
                            maxSize: "10MB",
                            tips: [
                              "Use imagens com boa qualidade e resolução",
                              "A imagem será adaptada para diferentes telas",
                              "Evite imagens com muito texto",
                              "Cores mais suaves funcionam melhor como fundo",
                              "A imagem terá uma sobreposição escura para melhor legibilidade"
                            ]
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Fundo exclusivo para sua página de links (opcional)
                        </p>
                      </div>
                    </div>

                    {/* Cores */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Cores da Página de Links</h3>
                        <Button variant="outline" size="sm" onClick={copySiteColors}>
                          Copiar cores do site principal
                        </Button>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-amber-800">
                          <strong>Importante:</strong> Estas cores são exclusivas para sua página de links pública. 
                          Alterar aqui não afeta as cores do seu site principal.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pagePrimaryColor">Cor Primária dos Links</Label>
                          <div className="flex gap-2">
                            <Input
                              id="pagePrimaryColor"
                              type="color"
                              value={previewData?.pagePrimaryColor || '#3b82f6'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pagePrimaryColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={previewData?.pagePrimaryColor || '#3b82f6'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pagePrimaryColor: e.target.value }))}
                              placeholder="#3b82f6"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Cor principal dos botões e destaques</p>
                        </div>

                        <div>
                          <Label htmlFor="pageSecondaryColor">Cor Secundária dos Links</Label>
                          <div className="flex gap-2">
                            <Input
                              id="pageSecondaryColor"
                              type="color"
                              value={previewData?.pageSecondaryColor || '#64748b'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageSecondaryColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={previewData?.pageSecondaryColor || '#64748b'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageSecondaryColor: e.target.value }))}
                              placeholder="#64748b"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Cor para ícones e elementos secundários</p>
                        </div>

                        <div>
                          <Label htmlFor="pageBackgroundColor">Cor de Fundo da Página</Label>
                          <div className="flex gap-2">
                            <Input
                              id="pageBackgroundColor"
                              type="color"
                              value={previewData?.pageBackgroundColor || '#ffffff'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageBackgroundColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={previewData?.pageBackgroundColor || '#ffffff'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageBackgroundColor: e.target.value }))}
                              placeholder="#ffffff"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Cor de fundo da página de links</p>
                        </div>

                        <div>
                          <Label htmlFor="pageSurfaceColor">Cor de Superfície</Label>
                          <div className="flex gap-2">
                            <Input
                              id="pageSurfaceColor"
                              type="color"
                              value={previewData?.pageSurfaceColor || '#f8fafc'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageSurfaceColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={previewData?.pageSurfaceColor || '#f8fafc'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageSurfaceColor: e.target.value }))}
                              placeholder="#f8fafc"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Cor para cards e superfícies elevadas</p>
                        </div>

                        <div>
                          <Label htmlFor="pageTextPrimaryColor">Cor do Texto Principal</Label>
                          <div className="flex gap-2">
                            <Input
                              id="pageTextPrimaryColor"
                              type="color"
                              value={previewData?.pageTextPrimaryColor || '#1e293b'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageTextPrimaryColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={previewData?.pageTextPrimaryColor || '#1e293b'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageTextPrimaryColor: e.target.value }))}
                              placeholder="#1e293b"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Cor dos títulos e textos principais</p>
                        </div>

                        <div>
                          <Label htmlFor="pageTextSecondaryColor">Cor do Texto Secundário</Label>
                          <div className="flex gap-2">
                            <Input
                              id="pageTextSecondaryColor"
                              type="color"
                              value={previewData?.pageTextSecondaryColor || '#64748b'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageTextSecondaryColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={previewData?.pageTextSecondaryColor || '#64748b'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageTextSecondaryColor: e.target.value }))}
                              placeholder="#64748b"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Cor para subtítulos e textos secundários</p>
                        </div>

                        <div>
                          <Label htmlFor="pageHoverColor">Cor de Hover</Label>
                          <div className="flex gap-2">
                            <Input
                              id="pageHoverColor"
                              type="color"
                              value={previewData?.pageHoverColor || '#f1f5f9'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageHoverColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={previewData?.pageHoverColor || '#f1f5f9'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageHoverColor: e.target.value }))}
                              placeholder="#f1f5f9"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Cor quando o mouse passa sobre botões</p>
                        </div>

                        <div>
                          <Label htmlFor="pageBorderColor">Cor das Bordas</Label>
                          <div className="flex gap-2">
                            <Input
                              id="pageBorderColor"
                              type="color"
                              value={previewData?.pageBorderColor || '#e2e8f0'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageBorderColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={previewData?.pageBorderColor || '#e2e8f0'}
                              onChange={(e) => setPreviewData(prev => ({ ...prev, pageBorderColor: e.target.value }))}
                              placeholder="#e2e8f0"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Cor para bordas e divisores</p>
                        </div>
                      </div>
                    </div>

                    {/* Configurações de Exibição */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Configurações de Exibição</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="showProfileImage">Mostrar foto do perfil</Label>
                            <p className="text-xs text-gray-500">Exibir a imagem do perfil na página</p>
                          </div>
                          <Switch
                            id="showProfileImage"
                            checked={previewData?.showProfileImage !== false}
                            onCheckedChange={(checked) => setPreviewData(prev => ({ ...prev, showProfileImage: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="showTitle">Mostrar título/profissão</Label>
                            <p className="text-xs text-gray-500">Exibir o título abaixo do nome</p>
                          </div>
                          <Switch
                            id="showTitle"
                            checked={previewData?.showTitle !== false}
                            onCheckedChange={(checked) => setPreviewData(prev => ({ ...prev, showTitle: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="showBio">Mostrar biografia</Label>
                            <p className="text-xs text-gray-500">Exibir a descrição na página</p>
                          </div>
                          <Switch
                            id="showBio"
                            checked={previewData?.showBio !== false}
                            onCheckedChange={(checked) => setPreviewData(prev => ({ ...prev, showBio: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="isPublic">Página pública</Label>
                            <p className="text-xs text-gray-500">Permitir acesso público à página</p>
                          </div>
                          <Switch
                            id="isPublic"
                            checked={previewData?.isPublic !== false}
                            onCheckedChange={(checked) => setPreviewData(prev => ({ ...prev, isPublic: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => previewData && savePageProfile(previewData)}
                        className="flex-1"
                      >
                        Salvar Alterações
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setPreviewData(pageProfile)}
                        className="flex-1"
                      >
                        Resetar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview da Página */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      Preview Mobile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Simulação de um iPhone */}
                    <div className="bg-gray-900 rounded-3xl p-2 mx-4 mb-4">
                      <div className="bg-black rounded-2xl overflow-hidden">
                        {/* Notch do iPhone */}
                        <div className="bg-black h-6 relative">
                          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full h-4 w-20"></div>
                        </div>
                        
                        {/* Conteúdo da página */}
                        <div className="bg-white min-h-[600px]">
                          {/* Header with background image */}
                          <div className="relative">
                            <div
                              className="h-48 bg-cover bg-center bg-no-repeat"
                              style={{
                                backgroundImage: previewData?.backgroundImageUrl 
                                  ? `url('${previewData.backgroundImageUrl}')` 
                                  : `linear-gradient(135deg, ${previewData?.pagePrimaryColor || '#667eea'} 0%, ${previewData?.pageSecondaryColor || '#764ba2'} 100%)`,
                              }}
                            />

                            {/* SVG Curve */}
                            <div className="absolute bottom-0 left-0 right-0">
                              <svg viewBox="0 0 1440 120" className="w-full h-6" preserveAspectRatio="none">
                                <path 
                                  d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z" 
                                  fill={previewData?.pageBackgroundColor || "white"} 
                                />
                              </svg>
                            </div>

                            {/* Profile Picture */}
                            {(previewData?.showProfileImage !== false) && (
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
                                  <div 
                                    className="w-full h-full bg-gray-200 flex items-center justify-center"
                                    style={{
                                      backgroundImage: previewData?.displayImageUrl ? `url(${previewData.displayImageUrl})` : undefined,
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center'
                                    }}
                                  >
                                    {!previewData?.displayImageUrl && (
                                      <span 
                                        className="text-lg font-bold text-white"
                                        style={{ color: previewData?.pagePrimaryColor || '#667eea' }}
                                      >
                                        {(previewData?.displayName || professionalName || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="px-4 pt-8 pb-6">
                            <div className="w-full">
                              {/* Name and title */}
                              <div className="text-center mb-4">
                                <h1 
                                  className="text-lg font-semibold mb-1"
                                  style={{ color: previewData?.pageTextPrimaryColor || '#111827' }}
                                >
                                  {previewData?.displayName || professionalName || 'Seu Nome'}
                                </h1>
                                {previewData?.displayTitle && (previewData?.showTitle !== false) && (
                                  <p 
                                    className="text-xs font-medium tracking-wider uppercase"
                                    style={{ color: previewData?.pageTextSecondaryColor || '#6b7280' }}
                                  >
                                    {previewData.displayTitle}
                                  </p>
                                )}
                              </div>

                              {/* Bio */}
                              {previewData?.displayBio && (previewData?.showBio !== false) && (
                                <div className="text-center mb-4">
                                  <p 
                                    className="text-xs leading-relaxed"
                                    style={{ color: previewData?.pageTextSecondaryColor || '#6b7280' }}
                                  >
                                    {previewData.displayBio}
                                  </p>
                                </div>
                              )}

                              {/* Social media icons */}
                              <div className="flex justify-center gap-4 mb-6">
                                {links.filter(link => link.displayAsIcon && link.isActive).slice(0, 4).map((link) => (
                                  <div
                                    key={link.id}
                                    className="hover:scale-110 transition-transform duration-200 cursor-pointer"
                                  >
                                    {/* Usar ícone personalizado ou baseado no tipo */}
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" 
                                         style={{ 
                                           backgroundColor: previewData?.pagePrimaryColor || '#667eea',
                                         }}>
                                      {link.icon ? 
                                        renderIconByValue(link.icon, 14, "text-white") : 
                                        renderSocialIcon(link.linkType, 14)
                                      }
                                    </div>
                                  </div>
                                ))}
                                {links.filter(link => link.displayAsIcon && link.isActive).length === 0 && (
                                  <div className="text-xs" style={{ color: previewData?.pageTextSecondaryColor || '#6b7280' }}>
                                    Links como ícones aparecerão aqui
                                  </div>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="space-y-3">
                                {links.filter(link => !link.displayAsIcon && link.isActive).slice(0, 3).map((link) => (
                                  <div
                                    key={link.id}
                                    className="w-full py-3 rounded-lg font-medium text-center text-xs cursor-pointer hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                                    style={{
                                      backgroundColor: previewData?.pagePrimaryColor || '#667eea',
                                      color: '#ffffff'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = previewData?.pageHoverColor || '#5a67d8';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = previewData?.pagePrimaryColor || '#667eea';
                                    }}
                                  >
                                    {link.icon && (
                                      <div className="flex items-center">
                                        {renderIconByValue(link.icon, 12, "text-white")}
                                      </div>
                                    )}
                                    <span className="text-balance leading-tight">
                                      {link.title}
                                    </span>
                                  </div>
                                ))}
                                
                                {links.filter(link => !link.displayAsIcon && link.isActive).length === 0 && (
                                  <div className="text-center py-6">
                                    <p 
                                      className="text-xs"
                                      style={{ color: previewData?.pageTextSecondaryColor || '#6b7280' }}
                                    >
                                      Links como botões aparecerão aqui
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra inferior do iPhone */}
                        <div className="bg-black h-6 flex justify-center items-center">
                          <div className="w-32 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
