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

  // Separar links sociais dos outros links
  const socialLinks = data.links.filter(link => 
    ['INSTAGRAM', 'WHATSAPP', 'FACEBOOK', 'YOUTUBE', 'LINKEDIN', 'TWITTER', 'TELEGRAM', 'TIKTOK'].includes(link.linkType)
  );
  const regularLinks = data.links.filter(link => 
    !['INSTAGRAM', 'WHATSAPP', 'FACEBOOK', 'YOUTUBE', 'LINKEDIN', 'TWITTER', 'TELEGRAM', 'TIKTOK'].includes(link.linkType)
  );

  return (
    <div className="min-h-screen relative">
      {/* Seção superior com background */}
      <div 
        className="relative min-h-[65vh] flex flex-col justify-center"
        style={{
          ...backgroundStyle,
          backgroundImage: data.backgroundImage 
            ? `url(${data.backgroundImage})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="relative z-10 max-w-sm mx-auto px-6 text-center">
          {/* Avatar */}
          <div className="mb-6">
            <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-2xl">
              <AvatarImage src={data.image} alt={data.name} className="object-cover" />
              <AvatarFallback 
                className="text-3xl font-bold text-white"
                style={{ backgroundColor: data.themePrimaryColor || '#8B5A3C' }}
              >
                {data.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Nome */}
          <h1 className="text-2xl font-bold mb-2 text-white">
            {data.name}
          </h1>
          
          {/* Título */}
          {data.title && (
            <p className="text-base mb-4 text-white/90 font-medium">
              {data.title}
            </p>
          )}
          
          {/* Bio */}
          {data.bio && (
            <p className="text-sm leading-relaxed mb-8 text-white/80 max-w-xs mx-auto">
              {data.bio}
            </p>
          )}

          {/* Links Sociais (Ícones) */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center space-x-4 mb-8">
              {socialLinks.map((link) => (
                <div
                  key={link.id}
                  className="cursor-pointer transform hover:scale-110 transition-transform duration-200"
                  onClick={() => handleLinkClick(link)}
                >
                  <LinkIcon linkType={link.linkType} icon={link.icon} size={24} isSmall={true} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção inferior curvada com links normais */}
      <div className="relative -mt-8">
        {/* Curva */}
        <div 
          className="h-8 rounded-t-3xl"
          style={{ backgroundColor: data.themeBackgroundColor || '#ffffff' }}
        ></div>
        
        {/* Conteúdo dos links */}
        <div 
          className="px-6 pb-12"
          style={{ backgroundColor: data.themeBackgroundColor || '#ffffff' }}
        >
          <div className="max-w-sm mx-auto">
            {regularLinks.length > 0 ? (
              <div className="space-y-4 pt-4">
                {regularLinks.map((link) => (
                  <div
                    key={link.id}
                    className="w-full rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: data.themeSurfaceColor || '#f8fafc',
                      border: `1px solid ${data.themeBorderColor || '#e2e8f0'}`
                    }}
                    onClick={() => handleLinkClick(link)}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="mr-4 flex-shrink-0">
                          <LinkIcon linkType={link.linkType} icon={link.icon} />
                        </div>
                        
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
                      </div>
                      
                      <div className="ml-3 flex-shrink-0">
                        <ExternalLink 
                          size={18} 
                          style={{ color: data.themeSecondaryColor || '#64748b' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p 
                  className="text-base"
                  style={{ color: data.themeTextSecondaryColor || '#64748b' }}
                >
                  Nenhum link disponível no momento.
                </p>
              </div>
            )}

            {/* Footer com botão "Create a free bio site" */}
            <div className="text-center mt-12 pt-6">
              <div 
                className="inline-flex items-center px-6 py-3 rounded-full border-2 transition-all duration-200 hover:shadow-md cursor-pointer"
                style={{ 
                  borderColor: data.themeBorderColor || '#e2e8f0',
                  backgroundColor: data.themeBackgroundColor || '#ffffff'
                }}
                onClick={() => window.open('/', '_blank')}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: data.themePrimaryColor || '#8B5A3C' }}
                ></div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: data.themeTextPrimaryColor || '#1e293b' }}
                >
                  CREATE A FREE BIO SITE
                </span>
                <ExternalLink 
                  size={16} 
                  className="ml-3"
                  style={{ color: data.themeTextSecondaryColor || '#64748b' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLinks;
