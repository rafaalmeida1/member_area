import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, MessageCircle, Phone, Mail, Instagram, Youtube, Linkedin, Facebook } from 'lucide-react';
import { publicLinksService } from '@/services/publicLinksService';
import { PublicLinksData, PublicLink, LinkType } from '@/types/publicLinks';

const LinkIcon = ({ linkType, icon }: { linkType: LinkType; icon?: string }) => {
  const iconProps = { size: 24, className: "flex-shrink-0" };
  
  if (icon) {
    // Se tiver ícone customizado, poderia renderizar aqui
    // Por enquanto, vamos usar os ícones padrão baseados no tipo
  }
  
  switch (linkType) {
    case 'WHATSAPP':
      return (
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
          <MessageCircle size={20} className="text-white" />
        </div>
      );
    case 'EMAIL':
      return (
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <Mail size={20} className="text-white" />
        </div>
      );
    case 'PHONE':
      return (
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
          <Phone size={20} className="text-white" />
        </div>
      );
    case 'SOCIAL_MEDIA':
      if (icon?.toLowerCase().includes('instagram')) {
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Instagram size={20} className="text-white" />
          </div>
        );
      } else if (icon?.toLowerCase().includes('youtube')) {
        return (
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <Youtube size={20} className="text-white" />
          </div>
        );
      } else if (icon?.toLowerCase().includes('linkedin')) {
        return (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Linkedin size={20} className="text-white" />
          </div>
        );
      } else if (icon?.toLowerCase().includes('facebook')) {
        return (
          <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
            <Facebook size={20} className="text-white" />
          </div>
        );
      }
      return (
        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
          <ExternalLink size={20} className="text-white" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
          <ExternalLink size={20} className="text-white" />
        </div>
      );
  }
};

const PublicLinks: React.FC = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const [data, setData] = useState<PublicLinksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!professionalId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const profId = parseInt(professionalId);
        if (isNaN(profId) || profId <= 0) {
          setError('ID do profissional inválido');
          return;
        }
        
        const response = await publicLinksService.getPublicLinks(profId);
        
        if (!response) {
          setError('Nenhum dado encontrado para este profissional');
          return;
        }
        
        setData(response);
      } catch (err: any) {
        console.error('Erro ao carregar links:', err);
        
        if (err.response?.status === 404) {
          setError('Profissional não encontrado. Verifique se o link está correto.');
        } else if (err.response?.status === 403) {
          setError('Esta página não está disponível publicamente.');
        } else if (err.response?.status >= 500) {
          setError('Erro interno do servidor. Tente novamente mais tarde.');
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } else {
          setError('Erro inesperado ao carregar a página. Tente recarregar.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [professionalId]);

  const handleLinkClick = async (link: PublicLink) => {
    // Função para abrir o link
    const openLink = () => {
      try {
        if (link.linkType === 'WHATSAPP') {
          const phoneNumber = link.url.replace(/\D/g, '');
          if (!phoneNumber) {
            console.error('Número de WhatsApp inválido');
            return;
          }
          const message = link.whatsappMessage ? encodeURIComponent(link.whatsappMessage) : '';
          const whatsappUrl = `https://wa.me/${phoneNumber}${message ? `?text=${message}` : ''}`;
          window.open(whatsappUrl, '_blank');
        } else if (link.linkType === 'EMAIL') {
          if (!link.url.includes('@')) {
            console.error('Email inválido');
            return;
          }
          window.location.href = `mailto:${link.url}`;
        } else if (link.linkType === 'PHONE') {
          const phoneNumber = link.url.replace(/\D/g, '');
          if (!phoneNumber) {
            console.error('Número de telefone inválido');
            return;
          }
          window.location.href = `tel:${link.url}`;
        } else {
          // Validar se a URL é válida
          let url = link.url;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
          }
          window.open(url, '_blank');
        }
      } catch (error) {
        console.error('Erro ao abrir link:', error);
      }
    };

    try {
      // Trackear o clique (sem bloquear a navegação)
      publicLinksService.trackLinkClick(link.id).catch(error => {
        console.error('Erro ao trackear clique (não crítico):', error);
      });
      
      // Abrir o link imediatamente
      openLink();
    } catch (error) {
      console.error('Erro geral ao processar clique:', error);
      // Mesmo com erro, tentar abrir o link
      openLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Página não encontrada'}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  const backgroundStyle = data.backgroundImage 
    ? {
        backgroundImage: `url(${data.backgroundImage})`,
        backgroundPosition: `${data.backgroundPositionX || 50}% ${data.backgroundPositionY || 50}%`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  const themeColors = {
    '--primary': data.themePrimaryColor || '#3b82f6',
    '--secondary': data.themeSecondaryColor || '#64748b',
    '--background': data.themeBackgroundColor || '#ffffff',
    '--surface': data.themeSurfaceColor || '#f8fafc',
    '--text-primary': data.themeTextPrimaryColor || '#1e293b',
    '--text-secondary': data.themeTextSecondaryColor || '#64748b',
    '--border': data.themeBorderColor || '#e2e8f0',
    '--hover': data.themeHoverColor || '#f1f5f9',
  } as React.CSSProperties;

  return (
    <div 
      className="min-h-screen relative"
      style={{
        ...backgroundStyle,
        ...themeColors,
        backgroundColor: data.themeBackgroundColor || '#f5f5f5'
      }}
    >
      {/* Overlay para melhor legibilidade se houver imagem de fundo */}
      {data.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      )}
      
      <div className="relative z-10 max-w-sm mx-auto px-6 py-8">
        {/* Header com perfil */}
        <div className="text-center mb-8">
          {/* Avatar maior e mais centralizado */}
          <div className="relative mb-6">
            <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-xl">
              <AvatarImage src={data.image} alt={data.name} className="object-cover" />
              <AvatarFallback 
                className="text-2xl font-bold text-white"
                style={{ backgroundColor: data.themePrimaryColor || '#8B5A3C' }}
              >
                {data.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: data.themeTextPrimaryColor || '#2C2C2C' }}
          >
            {data.name}
          </h1>
          
          {data.title && (
            <p 
              className="text-base mb-4 font-medium"
              style={{ color: data.themeTextSecondaryColor || '#666666' }}
            >
              {data.title}
            </p>
          )}
          
          {data.bio && (
            <p 
              className="text-sm leading-relaxed mb-6"
              style={{ color: data.themeTextSecondaryColor || '#666666' }}
            >
              {data.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {data.links.map((link) => (
            <div
              key={link.id}
              className="w-full rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
              style={{
                backgroundColor: data.themeSurfaceColor || '#ffffff',
                border: `1px solid ${data.themeBorderColor || '#e0e0e0'}`
              }}
              onClick={() => handleLinkClick(link)}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="mr-3 flex-shrink-0">
                    <LinkIcon linkType={link.linkType} icon={link.icon} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-base mb-1 truncate"
                      style={{ color: data.themeTextPrimaryColor || '#2C2C2C' }}
                    >
                      {link.title}
                    </h3>
                    
                    {link.description && (
                      <p 
                        className="text-sm leading-relaxed line-clamp-1"
                        style={{ color: data.themeTextSecondaryColor || '#666666' }}
                      >
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="ml-3 flex-shrink-0">
                  <ExternalLink 
                    size={18} 
                    style={{ color: data.themeSecondaryColor || '#999999' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.links.length === 0 && (
          <div className="text-center py-12">
            <p 
              className="text-base"
              style={{ color: data.themeTextSecondaryColor || '#666666' }}
            >
              Nenhum link disponível no momento.
            </p>
          </div>
        )}

        {/* Footer com botão "Create a free bio site" */}
        <div className="text-center mt-12 pt-6">
          <div 
            className="inline-flex items-center px-6 py-3 rounded-full border-2 transition-all duration-200 hover:shadow-md"
            style={{ 
              borderColor: data.themeBorderColor || '#e0e0e0',
              backgroundColor: data.themeBackgroundColor || '#ffffff'
            }}
          >
            <div 
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: data.themePrimaryColor || '#8B5A3C' }}
            ></div>
            <span 
              className="text-sm font-medium"
              style={{ color: data.themeTextPrimaryColor || '#2C2C2C' }}
            >
              CREATE A FREE BIO SITE
            </span>
            <ExternalLink 
              size={16} 
              className="ml-3"
              style={{ color: data.themeTextSecondaryColor || '#666666' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLinks;
