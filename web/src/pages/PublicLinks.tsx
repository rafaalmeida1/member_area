import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, MessageCircle, Phone, Mail, Instagram, Youtube, Linkedin, Facebook, Twitter, Send } from 'lucide-react';
import { publicLinksService } from '@/services/publicLinksService';
import { PublicLinksData, PublicLink, LinkType } from '@/types/publicLinks';

const LinkIcon = ({ linkType, icon, size = 20, isSmall = false }: { linkType: LinkType; icon?: string; size?: number; isSmall?: boolean }) => {
  const containerSize = isSmall ? "w-12 h-12" : "w-10 h-10";
  
  switch (linkType) {
    case 'WHATSAPP':
      return (
        <div className={`${containerSize} rounded-full bg-green-500 flex items-center justify-center shadow-lg`}>
          <MessageCircle size={size} className="text-white" />
        </div>
      );
    case 'EMAIL':
      return (
        <div className={`${containerSize} rounded-full bg-blue-500 flex items-center justify-center shadow-lg`}>
          <Mail size={size} className="text-white" />
        </div>
      );
    case 'PHONE':
      return (
        <div className={`${containerSize} rounded-full bg-gray-600 flex items-center justify-center shadow-lg`}>
          <Phone size={size} className="text-white" />
        </div>
      );
    case 'INSTAGRAM':
      return (
        <div className={`${containerSize} rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg`}>
          <Instagram size={size} className="text-white" />
        </div>
      );
    case 'YOUTUBE':
      return (
        <div className={`${containerSize} rounded-full bg-red-500 flex items-center justify-center shadow-lg`}>
          <Youtube size={size} className="text-white" />
        </div>
      );
    case 'LINKEDIN':
      return (
        <div className={`${containerSize} rounded-full bg-blue-600 flex items-center justify-center shadow-lg`}>
          <Linkedin size={size} className="text-white" />
        </div>
      );
    case 'FACEBOOK':
      return (
        <div className={`${containerSize} rounded-full bg-blue-700 flex items-center justify-center shadow-lg`}>
          <Facebook size={size} className="text-white" />
        </div>
      );
    case 'TWITTER':
      return (
        <div className={`${containerSize} rounded-full bg-black flex items-center justify-center shadow-lg`}>
          <Twitter size={size} className="text-white" />
        </div>
      );
    case 'TELEGRAM':
      return (
        <div className={`${containerSize} rounded-full bg-blue-400 flex items-center justify-center shadow-lg`}>
          <Send size={size} className="text-white" />
        </div>
      );
    case 'TIKTOK':
      return (
        <div className={`${containerSize} rounded-full bg-black flex items-center justify-center shadow-lg`}>
          <div className="text-white font-bold text-sm">TT</div>
        </div>
      );
    case 'SOCIAL_MEDIA':
      // Fallback para redes sociais genéricas
      if (icon?.toLowerCase().includes('instagram')) {
        return (
          <div className={`${containerSize} rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg`}>
            <Instagram size={size} className="text-white" />
          </div>
        );
      } else if (icon?.toLowerCase().includes('youtube')) {
        return (
          <div className={`${containerSize} rounded-full bg-red-500 flex items-center justify-center shadow-lg`}>
            <Youtube size={size} className="text-white" />
          </div>
        );
      } else if (icon?.toLowerCase().includes('linkedin')) {
        return (
          <div className={`${containerSize} rounded-full bg-blue-600 flex items-center justify-center shadow-lg`}>
            <Linkedin size={size} className="text-white" />
          </div>
        );
      } else if (icon?.toLowerCase().includes('facebook')) {
        return (
          <div className={`${containerSize} rounded-full bg-blue-700 flex items-center justify-center shadow-lg`}>
            <Facebook size={size} className="text-white" />
          </div>
        );
      }
      return (
        <div className={`${containerSize} rounded-full bg-gray-500 flex items-center justify-center shadow-lg`}>
          <ExternalLink size={size} className="text-white" />
        </div>
      );
    default:
      return (
        <div className={`${containerSize} rounded-full bg-gray-500 flex items-center justify-center shadow-lg`}>
          <ExternalLink size={size} className="text-white" />
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
        
        // Debug: Log das imagens recebidas
        console.log('Dados recebidos:', {
          image: response.image,
          backgroundImage: response.backgroundImage,
          name: response.name,
          title: response.title
        });
        
        setData(response);
      } catch (err: unknown) {
        console.error('Erro ao carregar links:', err);
        
        const axiosError = err as { response?: { status: number }; code?: string };
        if (axiosError.response?.status === 404) {
          setError('Profissional não encontrado. Verifique se o link está correto.');
        } else if (axiosError.response?.status === 403) {
          setError('Esta página não está disponível publicamente.');
        } else if (axiosError.response?.status && axiosError.response.status >= 500) {
          setError('Erro interno do servidor. Tente novamente mais tarde.');
        } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
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

  // Separar links sociais dos outros links
  const socialLinks = data.links.filter(link => 
    ['INSTAGRAM', 'WHATSAPP', 'FACEBOOK', 'YOUTUBE', 'LINKEDIN', 'TWITTER', 'TELEGRAM', 'TIKTOK'].includes(link.linkType)
  );
  const regularLinks = data.links.filter(link => 
    !['INSTAGRAM', 'WHATSAPP', 'FACEBOOK', 'YOUTUBE', 'LINKEDIN', 'TWITTER', 'TELEGRAM', 'TIKTOK'].includes(link.linkType)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header with background image */}
      <div className="relative">
        <div
          className="h-64 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: data.backgroundImage 
              ? `url('${data.backgroundImage}')` 
              : `linear-gradient(135deg, ${data.themePrimaryColor || '#667eea'} 0%, ${data.themeSecondaryColor || '#764ba2'} 100%)`,
            ...backgroundStyle
          }}
        />

        {/* SVG Curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-8" preserveAspectRatio="none">
            <path 
              d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z" 
              fill={data.themeBackgroundColor || "white"} 
            />
          </svg>
        </div>

        {/* Profile Picture */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Avatar className="w-full h-full">
              <AvatarImage 
                src={data.image} 
                alt={data.name} 
                className="object-cover"
                onError={() => console.log('Erro ao carregar imagem do perfil:', data.image)}
                onLoad={() => console.log('Imagem do perfil carregada com sucesso:', data.image)}
              />
              <AvatarFallback 
                className="text-2xl font-bold text-white w-full h-full flex items-center justify-center"
                style={{ backgroundColor: data.themePrimaryColor || '#667eea' }}
              >
                {data.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="px-6 pt-12 pb-8">
        <div className="w-full max-w-sm mx-auto">
          {/* Name and title */}
          <div className="text-center mb-6">
            <h1 
              className="text-2xl font-semibold mb-1"
              style={{ color: data.themeTextPrimaryColor || '#111827' }}
            >
              {data.name}
            </h1>
            {data.title && (
              <p 
                className="text-sm font-medium tracking-wider uppercase"
                style={{ color: data.themeTextSecondaryColor || '#6b7280' }}
              >
                {data.title}
              </p>
            )}
          </div>

          {/* Bio */}
          {data.bio && (
            <div className="text-center mb-6">
              <p 
                className="text-sm leading-relaxed"
                style={{ color: data.themeTextSecondaryColor || '#6b7280' }}
              >
                {data.bio}
              </p>
            </div>
          )}

          {/* Social media icons */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-6 mb-8">
              {socialLinks.map((link) => (
                <button 
                  key={link.id}
                  className="p-2 hover:scale-110 transition-transform duration-200"
                  onClick={() => handleLinkClick(link)}
                >
                  <div style={{ color: data.themeTextPrimaryColor || '#374151' }}>
                    {renderSocialIcon(link.linkType, 24)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {regularLinks.length > 0 ? (
            <div className="space-y-4">
              {regularLinks.map((link) => (
                <button
                  key={link.id}
                  className="w-full py-4 rounded-lg font-medium border-0 transition-all duration-200 hover:scale-[1.02] text-center"
                  style={{
                    backgroundColor: data.themeSurfaceColor || '#f3f4f6',
                    color: data.themeTextPrimaryColor || '#374151'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = data.themeHoverColor || '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = data.themeSurfaceColor || '#f3f4f6';
                  }}
                  onClick={() => handleLinkClick(link)}
                >
                  <span className="text-balance leading-tight">
                    {link.title}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p 
                className="text-base"
                style={{ color: data.themeTextSecondaryColor || '#6b7280' }}
              >
                Nenhum link disponível no momento.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  // Função para renderizar ícones sociais
  function renderSocialIcon(linkType: LinkType, size: number) {
    const iconProps = { size, className: "text-current" };
    
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
        return <div className="text-current font-bold text-sm">TT</div>;
      default:
        return <ExternalLink {...iconProps} />;
    }
  }
};

export default PublicLinks;
