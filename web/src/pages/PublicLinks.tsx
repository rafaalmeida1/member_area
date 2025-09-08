import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
    ExternalLink,
    MessageCircle,
    Phone,
    Mail,
    Instagram,
    Youtube,
    Linkedin,
    Facebook,
    Twitter,
    Send,
} from "lucide-react";
import { publicLinksService } from "@/services/publicLinksService";
import { PublicLinksData, PublicLink, LinkType } from "@/types/publicLinks";

const LinkIcon = ({
    linkType,
    icon,
    size = 20,
    isSmall = false,
    customColor,
}: {
    linkType: LinkType;
    icon?: string;
    size?: number;
    isSmall?: boolean;
    customColor?: string;
}) => {
    const containerSize = isSmall ? "w-12 h-12" : "w-10 h-10";
    const color = "white";

    // Função para renderizar ícones SVG originais
    const getIconContent = () => {
        switch (linkType) {
            case "WHATSAPP":
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" />
                    </svg>
                );
            case "EMAIL":
                return <Mail size={size} color={color} />;
            case "PHONE":
                return <Phone size={size} color={color} />;
            case "INSTAGRAM":
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                );
            case "YOUTUBE":
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                );
            case "LINKEDIN":
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                );
            case "FACEBOOK":
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                );
            case "TWITTER":
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                );
            case "TELEGRAM":
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                );
            case "TIKTOK":
                return (
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                );
            default:
                return <ExternalLink size={size} color={color} />;
        }
    };

    const getDefaultBackgroundClass = () => {
        if (customColor) return "";

        switch (linkType) {
            case "WHATSAPP":
                return "bg-green-500";
            case "EMAIL":
                return "bg-blue-500";
            case "PHONE":
                return "bg-gray-600";
            case "INSTAGRAM":
                return "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500";
            case "YOUTUBE":
                return "bg-red-500";
            case "LINKEDIN":
                return "bg-blue-600";
            case "FACEBOOK":
                return "bg-blue-700";
            case "TWITTER":
                return "bg-black";
            case "TELEGRAM":
                return "bg-blue-400";
            case "TIKTOK":
                return "bg-black";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div
            className={`${containerSize} rounded-full flex items-center justify-center shadow-lg ${getDefaultBackgroundClass()}`}
            style={customColor ? { backgroundColor: customColor } : {}}
        >
            {getIconContent()}
        </div>
    );
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
                    setError("ID do profissional inválido");
                    return;
                }

                const response = await publicLinksService.getPublicLinks(
                    profId
                );

                if (!response) {
                    setError("Nenhum dado encontrado para este profissional");
                    return;
                }

                // Debug: Log das URLs das imagens recebidas
                console.log("=== DEBUG IMAGENS ===");
                console.log("Image URL recebida:", response.image);
                console.log(
                    "Background Image URL recebida:",
                    response.backgroundImage
                );
                console.log("Base URL atual:", window.location.origin);

                // Testar se as URLs são acessíveis
                if (response.image) {
                    console.log("Testando acesso à imagem de perfil...");
                    fetch(response.image)
                        .then((res) =>
                            console.log("Status imagem de perfil:", res.status)
                        )
                        .catch((err) =>
                            console.log(
                                "Erro ao acessar imagem de perfil:",
                                err
                            )
                        );
                }

                if (response.backgroundImage) {
                    console.log("Testando acesso à imagem de fundo...");
                    fetch(response.backgroundImage)
                        .then((res) =>
                            console.log("Status imagem de fundo:", res.status)
                        )
                        .catch((err) =>
                            console.log("Erro ao acessar imagem de fundo:", err)
                        );
                }
                console.log("=== FIM DEBUG IMAGENS ===");

                setData(response);
            } catch (err: unknown) {
                console.error("Erro ao carregar links:", err);

                const axiosError = err as {
                    response?: { status: number };
                    code?: string;
                };
                if (axiosError.response?.status === 404) {
                    setError(
                        "Profissional não encontrado. Verifique se o link está correto."
                    );
                } else if (axiosError.response?.status === 403) {
                    setError("Esta página não está disponível publicamente.");
                } else if (
                    axiosError.response?.status &&
                    axiosError.response.status >= 500
                ) {
                    setError(
                        "Erro interno do servidor. Tente novamente mais tarde."
                    );
                } else if (
                    axiosError.code === "NETWORK_ERROR" ||
                    !axiosError.response
                ) {
                    setError(
                        "Erro de conexão. Verifique sua internet e tente novamente."
                    );
                } else {
                    setError(
                        "Erro inesperado ao carregar a página. Tente recarregar."
                    );
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
                if (link.linkType === "WHATSAPP") {
                    const phoneNumber = link.url.replace(/\D/g, "");
                    if (!phoneNumber) {
                        console.error("Número de WhatsApp inválido");
                        return;
                    }
                    const message = link.whatsappMessage
                        ? encodeURIComponent(link.whatsappMessage)
                        : "";
                    const whatsappUrl = `https://wa.me/${phoneNumber}${
                        message ? `?text=${message}` : ""
                    }`;
                    window.open(whatsappUrl, "_blank");
                } else if (link.linkType === "EMAIL") {
                    if (!link.url.includes("@")) {
                        console.error("Email inválido");
                        return;
                    }
                    window.location.href = `mailto:${link.url}`;
                } else if (link.linkType === "PHONE") {
                    const phoneNumber = link.url.replace(/\D/g, "");
                    if (!phoneNumber) {
                        console.error("Número de telefone inválido");
                        return;
                    }
                    window.location.href = `tel:${link.url}`;
                } else {
                    // Validar se a URL é válida
                    let url = link.url;
                    if (
                        !url.startsWith("http://") &&
                        !url.startsWith("https://")
                    ) {
                        url = `https://${url}`;
                    }
                    window.open(url, "_blank");
                }
            } catch (error) {
                console.error("Erro ao abrir link:", error);
            }
        };

        try {
            // Trackear o clique (sem bloquear a navegação)
            publicLinksService.trackLinkClick(link.id).catch((error) => {
                console.error("Erro ao trackear clique (não crítico):", error);
            });

            // Abrir o link imediatamente
            openLink();
        } catch (error) {
            console.error("Erro geral ao processar clique:", error);
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
                    <p className="text-red-600 mb-4">
                        {error || "Página não encontrada"}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    const backgroundStyle = data.backgroundImage
        ? {
              backgroundImage: `url(${data.backgroundImage})`,
              backgroundPosition: `${data.backgroundPositionX || 50}% ${
                  data.backgroundPositionY || 50
              }%`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
          }
        : {};

    const themeColors = {
        "--primary": data.themePrimaryColor || "#3b82f6",
        "--secondary": data.themeSecondaryColor || "#64748b",
        "--background": data.themeBackgroundColor || "#ffffff",
        "--surface": data.themeSurfaceColor || "#f8fafc",
        "--text-primary": data.themeTextPrimaryColor || "#1e293b",
        "--text-secondary": data.themeTextSecondaryColor || "#64748b",
        "--border": data.themeBorderColor || "#e2e8f0",
        "--hover": data.themeHoverColor || "#f1f5f9",
    } as React.CSSProperties;

    // Separar links baseado no campo displayAsIcon
    const socialLinks = data.links.filter((link) => link.displayAsIcon);
    const regularLinks = data.links.filter((link) => !link.displayAsIcon);

    return (
        <div className="min-h-screen bg-white">
            {/* Header with background image */}
            <div className="relative">
                <div
                    className="h-64 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: data.backgroundImage
                            ? `url('${data.backgroundImage}')`
                            : `linear-gradient(135deg, ${
                                  data.themePrimaryColor || "#667eea"
                              } 0%, ${
                                  data.themeSecondaryColor || "#764ba2"
                              } 100%)`,
                        ...backgroundStyle,
                    }}
                    onError={() => {
                        console.log(
                            "Erro ao carregar imagem de fundo:",
                            data.backgroundImage
                        );
                    }}
                />

                {/* SVG Curve */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg
                        viewBox="0 0 1440 120"
                        className="w-full h-8"
                        preserveAspectRatio="none"
                    >
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
                                onError={(e) => {
                                    console.log(
                                        "Erro ao carregar imagem do perfil:",
                                        {
                                            src: data.image,
                                            error: e,
                                            element: e.target,
                                        }
                                    );
                                }}
                                onLoad={() => {
                                    console.log(
                                        "Imagem do perfil carregada com sucesso:",
                                        data.image
                                    );
                                }}
                            />
                            <AvatarFallback
                                className="text-2xl font-bold text-white w-full h-full flex items-center justify-center"
                                style={{
                                    backgroundColor:
                                        data.themePrimaryColor || "#667eea",
                                }}
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
                            style={{
                                color: data.themeTextPrimaryColor || "#111827",
                            }}
                        >
                            {data.name || 'Profissional'}
                        </h1>
                        {data.title && (
                            <p
                                className="text-sm font-medium tracking-wider uppercase"
                                style={{
                                    color:
                                        data.themeTextSecondaryColor ||
                                        "#6b7280",
                                }}
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
                                style={{
                                    color:
                                        data.themeTextSecondaryColor ||
                                        "#6b7280",
                                }}
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
                                    <LinkIcon
                                        linkType={link.linkType}
                                        icon={link.icon}
                                        size={20}
                                        isSmall={false}
                                        customColor={data.themePrimaryColor}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Action buttons */}
                    {regularLinks.length > 0 ? (
                        <div className="space-y-4">
                            {regularLinks.map((link) => {
                                const buttonBgColor =
                                    data.themePrimaryColor || "#667eea";
                                const buttonTextColor = "#ffffff";

                                console.log("Cores do botão:", {
                                    backgroundColor: buttonBgColor,
                                    color: buttonTextColor,
                                    themePrimaryColor: data.themePrimaryColor,
                                    themeHoverColor: data.themeHoverColor,
                                });

                                return (
                                    <button
                                        key={link.id}
                                        className="w-full py-4 rounded-lg font-medium border-0 transition-all duration-200 hover:scale-[1.02] text-center"
                                        style={{
                                            backgroundColor: buttonBgColor,
                                            color: buttonTextColor,
                                            border: "none",
                                            outline: "none",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                data.themeHoverColor ||
                                                "#5a67d8";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                buttonBgColor;
                                        }}
                                        onClick={() => handleLinkClick(link)}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="text-balance leading-tight">
                                                {link.title}
                                            </span>
                                            <span className="text-xs text-wrap">
                                                {link.description}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p
                                className="text-base"
                                style={{
                                    color:
                                        data.themeTextSecondaryColor ||
                                        "#6b7280",
                                }}
                            >
                                Nenhum link disponível no momento.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicLinks;
