import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, MessageCircle, Phone, Mail, Instagram, Youtube, Linkedin, Facebook } from 'lucide-react';
import { publicLinksService } from '@/services/publicLinksService';
import { PublicLinksData, PublicLink, LinkType } from '@/types/publicLinks';

const LinkIcon = ({ linkType, icon }: { linkType: LinkType; icon?: string }) => {
  const iconProps = { size: 20, className: "mr-3" };
  
  if (icon) {
    // Se tiver ícone customizado, poderia renderizar aqui
    // Por enquanto, vamos usar os ícones padrão baseados no tipo
  }
  
  switch (linkType) {
    case 'WHATSAPP':
      return <MessageCircle {...iconProps} className="mr-3 text-green-500" />;
    case 'EMAIL':
      return <Mail {...iconProps} className="mr-3 text-blue-500" />;
    case 'PHONE':
      return <Phone {...iconProps} className="mr-3 text-gray-600" />;
    case 'SOCIAL_MEDIA':
      if (icon?.toLowerCase().includes('instagram')) {
        return <Instagram {...iconProps} className="mr-3 text-pink-500" />;
      } else if (icon?.toLowerCase().includes('youtube')) {
        return <Youtube {...iconProps} className="mr-3 text-red-500" />;
      } else if (icon?.toLowerCase().includes('linkedin')) {
        return <Linkedin {...iconProps} className="mr-3 text-blue-600" />;
      } else if (icon?.toLowerCase().includes('facebook')) {
        return <Facebook {...iconProps} className="mr-3 text-blue-700" />;
      }
      return <ExternalLink {...iconProps} />;
    default:
      return <ExternalLink {...iconProps} />;
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
        backgroundColor: data.themeBackgroundColor || '#f8fafc'
      }}
    >
      {/* Overlay para melhor legibilidade se houver imagem de fundo */}
      {data.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      )}
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Header com perfil */}
        <div className="text-center mb-8">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
            <AvatarImage src={data.image} alt={data.name} />
            <AvatarFallback style={{ backgroundColor: data.themePrimaryColor || '#3b82f6' }}>
              {data.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: data.themeTextPrimaryColor || '#1e293b' }}
          >
            {data.name}
          </h1>
          
          {data.title && (
            <p 
              className="text-lg mb-3"
              style={{ color: data.themeSecondaryColor || '#64748b' }}
            >
              {data.title}
            </p>
          )}
          
          {data.bio && (
            <p 
              className="text-sm leading-relaxed max-w-sm mx-auto"
              style={{ color: data.themeTextSecondaryColor || '#64748b' }}
            >
              {data.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4">
          {data.links.map((link) => (
            <Card 
              key={link.id} 
              className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              style={{
                backgroundColor: data.themeSurfaceColor || '#ffffff',
                borderColor: data.themeBorderColor || '#e2e8f0'
              }}
              onClick={() => handleLinkClick(link)}
            >
              <CardContent 
                className="p-4 hover:bg-opacity-90 transition-colors duration-200"
                style={{
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = data.themeHoverColor || '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center">
                  <LinkIcon linkType={link.linkType} icon={link.icon} />
                  
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-base mb-1 truncate"
                      style={{ color: data.themeTextPrimaryColor || '#1e293b' }}
                    >
                      {link.title}
                    </h3>
                    
                    {link.description && (
                      <p 
                        className="text-sm leading-relaxed line-clamp-2"
                        style={{ color: data.themeTextSecondaryColor || '#64748b' }}
                      >
                        {link.description}
                      </p>
                    )}
                  </div>
                  
                  <ExternalLink 
                    size={16} 
                    className="ml-2 flex-shrink-0"
                    style={{ color: data.themeSecondaryColor || '#64748b' }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {data.links.length === 0 && (
          <div className="text-center py-12">
            <p 
              className="text-lg"
              style={{ color: data.themeTextSecondaryColor || '#64748b' }}
            >
              Nenhum link disponível no momento.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t" style={{ borderColor: data.themeBorderColor || '#e2e8f0' }}>
          <p 
            className="text-xs"
            style={{ color: data.themeTextSecondaryColor || '#64748b' }}
          >
            Criado com ❤️ pelo NutriThata
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicLinks;
