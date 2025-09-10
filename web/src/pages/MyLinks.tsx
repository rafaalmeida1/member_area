import React, { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    GripVertical,
    ExternalLink,
    BarChart3,
    Palette,
    Eye,
    Phone,
    Mail,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/components/SortableItem";
import { LoadingState } from "@/components/LoadingState";
import { publicLinksService } from "@/services/publicLinksService";
import { LinkResponse, LinkRequest, LinkType } from "@/types/publicLinks";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { ModernLayout } from "@/components/ModernLayout";
import { analyticsService } from "@/services/analyticsService";
import { PageAnalytics } from "@/types/analytics";
import { linkPageProfileService } from "@/services/linkPageProfileService";
import {
    LinkPageProfileRequest,
    LinkPageProfileResponse,
} from "@/types/linkPageProfile";
import { FileUpload } from "@/components/FileUpload";
import "./MyLinks.css";

const linkSchema = z
    .object({
        title: z
            .string()
            .min(1, "Título é obrigatório")
            .max(100, "Título deve ter no máximo 100 caracteres")
            .trim(),
        description: z
            .string()
            .max(500, "Descrição deve ter no máximo 500 caracteres")
            .optional()
            .or(z.literal("")),
        url: z
            .string()
            .min(1, "URL é obrigatória")
            .refine((url) => {
                // Validação customizada baseada no tipo de link
                const urlPattern =
                    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-@]*)*\/?$/;
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phonePattern = /^[+]?[1-9][\d]{0,15}$/;
                const whatsappPattern = /^[+]?[1-9][\d]{0,15}$/;

                // Para email específico (sem http/https no início)
                if (
                    !url.startsWith("http") &&
                    !url.startsWith("www") &&
                    url.includes("@") &&
                    !url.includes("/")
                ) {
                    return emailPattern.test(url);
                }

                // Para telefone/whatsapp (apenas números)
                if (/^[+]?[\d\s-()]+$/.test(url)) {
                    return whatsappPattern.test(url.replace(/[\s-()]/g, ""));
                }

                // Para URLs normais (incluindo com @)
                return (
                    urlPattern.test(url) ||
                    url.startsWith("http://") ||
                    url.startsWith("https://")
                );
            }, "URL inválida. Verifique o formato.")
            .transform((url) => {
                // Normalizar URL se necessário
                if (
                    !url.startsWith("http") &&
                    !url.startsWith("www") &&
                    url.includes("@") &&
                    !url.includes("/")
                )
                    return url; // Email
                if (/^[+]?[\d\s-()]+$/.test(url))
                    return url.replace(/[\s-()]/g, ""); // Telefone
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    return `https://${url}`;
                }
                return url;
            }),
        linkType: z.enum(
            [
                "SOCIAL_MEDIA",
                "WEBSITE",
                "WHATSAPP",
                "EMAIL",
                "PHONE",
                "YOUTUBE",
                "LINKEDIN",
                "FACEBOOK",
                "TIKTOK",
                "INSTAGRAM",
                "TWITTER",
                "TELEGRAM",
                "CUSTOM",
            ] as const,
            {
                errorMap: () => ({
                    message: "Selecione um tipo de link válido",
                }),
            }
        ),
        icon: z
            .string()
            .max(255, "Ícone deve ter no máximo 255 caracteres")
            .optional()
            .or(z.literal("")),
        whatsappMessage: z
            .string()
            .max(
                1000,
                "Mensagem do WhatsApp deve ter no máximo 1000 caracteres"
            )
            .optional()
            .or(z.literal("")),
        displayAsIcon: z.boolean().default(false),
        isActive: z.boolean().default(true),
    })
    .refine(
        (data) => {
            // Validação condicional: WhatsApp deve ter número válido
            if (data.linkType === "WHATSAPP") {
                const phonePattern = /^[+]?[1-9][\d]{0,15}$/;
                return phonePattern.test(data.url.replace(/[\s-()]/g, ""));
            }
            return true;
        },
        {
            message:
                "Para WhatsApp, insira um número válido (ex: 5511999999999)",
            path: ["url"],
        }
    )
    .refine(
        (data) => {
            // Validação condicional: Email deve ter formato válido
            if (data.linkType === "EMAIL") {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailPattern.test(data.url);
            }
            return true;
        },
        {
            message:
                "Para email, insira um endereço válido (ex: seu@email.com)",
            path: ["url"],
        }
    )
    .refine(
        (data) => {
            // Validação condicional: Telefone deve ter formato válido
            if (data.linkType === "PHONE") {
                const phonePattern = /^[+]?[1-9][\d]{0,15}$/;
                return phonePattern.test(data.url.replace(/[\s-()]/g, ""));
            }
            return true;
        },
        {
            message: "Para telefone, insira um número válido (ex: 11999999999)",
            path: ["url"],
        }
    );

type LinkFormData = z.infer<typeof linkSchema>;

// Lista de ícones disponíveis com SVGs originais
const availableIcons = [
    { value: "instagram", label: "Instagram" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "facebook", label: "Facebook" },
    { value: "twitter", label: "X (Twitter)" },
    { value: "youtube", label: "YouTube" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "telegram", label: "Telegram" },
    { value: "tiktok", label: "TikTok" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Telefone" },
    { value: "website", label: "Site/Website" },
];

// Função para renderizar ícone baseado no valor
const renderIconByValue = (
    iconValue: string | undefined,
    size = 20,
    customColor?: string
) => {
    // Se não tem valor ou é "default", retorna null para usar o ícone padrão do tipo
    if (!iconValue || iconValue === "default") {
        return null;
    }

    const color = customColor || "currentColor";

    // Usar a mesma função de renderização dos ícones sociais
    switch (iconValue) {
        case "instagram":
            return renderSocialIcon("INSTAGRAM", size, color);
        case "whatsapp":
            return renderSocialIcon("WHATSAPP", size, color);
        case "facebook":
            return renderSocialIcon("FACEBOOK", size, color);
        case "twitter":
            return renderSocialIcon("TWITTER", size, color);
        case "youtube":
            return renderSocialIcon("YOUTUBE", size, color);
        case "linkedin":
            return renderSocialIcon("LINKEDIN", size, color);
        case "telegram":
            return renderSocialIcon("TELEGRAM", size, color);
        case "tiktok":
            return renderSocialIcon("TIKTOK", size, color);
        case "email":
            return renderSocialIcon("EMAIL", size, color);
        case "phone":
            return renderSocialIcon("PHONE", size, color);
        case "website":
            return <ExternalLink size={size} color={color} />;
        default:
            return <ExternalLink size={size} color={color} />;
    }
};

// Função para renderizar ícones sociais no preview com SVGs originais
const renderSocialIcon = (
    linkType: LinkType,
    size = 20,
    customColor?: string
) => {
    const color = customColor || "currentColor";

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
    const [professionalName, setProfessionalName] = useState("");
    const [analytics, setAnalytics] = useState<PageAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [pageProfile, setPageProfile] =
        useState<LinkPageProfileResponse | null>(null);
    const [pageProfileLoading, setPageProfileLoading] = useState(false);
    const [previewData, setPreviewData] =
        useState<LinkPageProfileRequest | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

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
        formState: { errors, isSubmitting },
    } = useForm<LinkFormData>({
        resolver: zodResolver(linkSchema),
        defaultValues: {
            isActive: true,
        },
    });

    const watchLinkType = watch("linkType");

    const loadProfessionalProfile = async () => {
        try {
            const data = await apiService.getProfessionalProfile();
            setProfessionalName(data.name || "");
        } catch (error: unknown) {
            console.error("Erro ao carregar perfil profissional:", error);
            // Não bloquear a página se não conseguir carregar o perfil
            setProfessionalName("");
        }
    };

    const loadLinks = useCallback(async () => {
        try {
            console.log("MyLinks: Iniciando carregamento de links...");
            setLoading(true);
            const data = await publicLinksService.getAllLinks();
            console.log("MyLinks: Links carregados com sucesso:", data.length);
            setLinks(data);
        } catch (error: unknown) {
            console.error("MyLinks: Erro ao carregar links:", error);

            const axiosError = error as {
                response?: { status: number; data?: { message?: string } };
                code?: string;
            };
            if (axiosError.response?.status === 401) {
                toast({
                    title: "Sessão Expirada",
                    description: "Faça login novamente.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 403) {
                toast({
                    title: "Acesso Negado",
                    description:
                        "Você não tem permissão para acessar os links.",
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
                    description:
                        "Erro interno do servidor. Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } else if (
                axiosError.code === "NETWORK_ERROR" ||
                !axiosError.response
            ) {
                toast({
                    title: "Erro de Conexão",
                    description: "Verifique sua internet e tente novamente.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro Inesperado",
                    description:
                        "Erro inesperado ao carregar links. Recarregue a página.",
                    variant: "destructive",
                });
            }

            // Definir estado vazio em caso de erro
            setLinks([]);
        } finally {
            console.log("MyLinks: Finalizando carregamento de links...");
            setLoading(false);
        }
    }, [toast]);

    const onSubmit = async (data: LinkFormData) => {
        try {
            // Validação adicional antes do envio
            if (!data.title.trim()) {
                showErrorToast(
                    "Título Obrigatório",
                    "O título do link é obrigatório."
                );
                return;
            }

            if (!data.url.trim()) {
                showErrorToast(
                    "URL Obrigatória",
                    "A URL do link é obrigatória."
                );
                return;
            }

            // Validar limite de links (máximo 50 por profissional)
            if (!editingLink && links.length >= 50) {
                showErrorToast(
                    "Limite Atingido",
                    "Você atingiu o limite máximo de 50 links."
                );
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
                const updatedLink = await publicLinksService.updateLink(
                    editingLink.id,
                    linkData
                );
                setLinks(
                    links.map((link) =>
                        link.id === editingLink.id ? updatedLink : link
                    )
                );
                showSuccessToast("Link atualizado com sucesso!");
            } else {
                const newLink = await publicLinksService.createLink(linkData);
                setLinks([...links, newLink]);
                showSuccessToast("Link criado com sucesso!");
            }

            handleCloseDialog();
        } catch (error: unknown) {
            console.error("Erro ao salvar link:", error);

            // Tratamento específico de erros
            const axiosError = error as {
                response?: { status: number; data?: { message?: string } };
                code?: string;
            };
            if (axiosError.response?.status === 400) {
                const errorMessage =
                    axiosError.response?.data?.message || "Dados inválidos";
                if (errorMessage.includes("título")) {
                    toast({
                        title: "Título inválido",
                        description:
                            "Título inválido. Verifique se não está vazio ou muito longo.",
                        variant: "destructive",
                    });
                } else if (
                    errorMessage.includes("URL") ||
                    errorMessage.includes("url")
                ) {
                    toast({
                        title: "URL inválida",
                        description:
                            "URL inválida. Verifique o formato da URL.",
                        variant: "destructive",
                    });
                } else if (errorMessage.includes("tipo")) {
                    toast({
                        title: "Tipo de link inválido",
                        description: "Tipo de link inválido.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Erro de validação",
                        description: `Err o de validação: ${errorMessage}`,
                        variant: "destructive",
                    });
                }
            } else if (axiosError.response?.status === 401) {
                toast({
                    title: "Sessão expirada",
                    description: "Sessão expirada. Faça login novamente.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 403) {
                toast({
                    title: "Você não tem permissão para realizar esta ação.",
                    description:
                        "Você não tem permissão para realizar esta ação.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 404) {
                toast({
                    title: "Link não encontrado",
                    description: "Link não encontrado.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 409) {
                toast({
                    title: "Já existe um link com este título",
                    description: "Já existe um link com este título.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 422) {
                toast({
                    title: "Dados não processáveis",
                    description:
                        "Dados não processáveis. Verifique as informações.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status >= 500) {
                toast({
                    title: "Erro interno do servidor",
                    description:
                        "Erro interno do servidor. Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } else if (
                axiosError.code === "NETWORK_ERROR" ||
                !axiosError.response
            ) {
                toast({
                    title: "Erro de conexão",
                    description: "Erro de conexão. Verifique sua internet.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro inesperado ao salvar link",
                    description:
                        "Erro inesperado ao salvar link. Tente novamente.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleEdit = (link: LinkResponse) => {
        setEditingLink(link);
        reset({
            title: link.title,
            description: link.description || "",
            url: link.url,
            linkType: link.linkType,
            icon: link.icon || "",
            whatsappMessage: link.whatsappMessage || "",
            displayAsIcon: link.displayAsIcon || false,
            isActive: link.isActive,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (linkId: number) => {
        if (
            !confirm(
                "Tem certeza que deseja excluir este link? Esta ação não pode ser desfeita."
            )
        )
            return;

        try {
            await publicLinksService.deleteLink(linkId);
            setLinks(links.filter((link) => link.id !== linkId));
            showSuccessToast("Link excluído com sucesso!");
        } catch (error: unknown) {
            console.error("Erro ao excluir link:", error);

            const axiosError = error as {
                response?: { status: number; data?: { message?: string } };
                code?: string;
            };
            if (axiosError.response?.status === 401) {
                toast({
                    title: "Sessão expirada",
                    description: "Sessão expirada. Faça login novamente.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 403) {
                toast({
                    title: "Você não tem permissão para excluir este link",
                    description:
                        "Você não tem permissão para excluir este link.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 404) {
                toast({
                    title: "Link não encontrado ou já foi excluído",
                    description: "Link não encontrado ou já foi excluído.",
                    variant: "destructive",
                });
                // Remover da lista local se não existe mais
                setLinks(links.filter((link) => link.id !== linkId));
            } else if (axiosError.response?.status >= 500) {
                toast({
                    title: "Erro interno do servidor",
                    description:
                        "Erro interno do servidor. Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } else if (
                axiosError.code === "NETWORK_ERROR" ||
                !axiosError.response
            ) {
                toast({
                    title: "Erro de conexão",
                    description: "Erro de conexão. Verifique sua internet.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro inesperado ao excluir link",
                    description:
                        "Erro inesperado ao excluir link. Tente novamente.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingLink(null);
        reset({
            title: "",
            description: "",
            url: "",
            linkType: "WEBSITE",
            icon: "",
            whatsappMessage: "",
            displayAsIcon: false,
            isActive: true,
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = links.findIndex(
            (link) => link.id === Number(active.id)
        );
        const newIndex = links.findIndex((link) => link.id === Number(over.id));

        if (oldIndex === -1 || newIndex === -1) {
            toast({
                title: "Erro ao identificar posição dos links",
                description: "Erro ao identificar posição dos links",
                variant: "destructive",
            });
            return;
        }

        const originalLinks = [...links];
        const newLinks = arrayMove(links, oldIndex, newIndex);

        // Atualizar UI otimisticamente
        setLinks(newLinks);

        try {
            await publicLinksService.reorderLinks({
                linkIds: newLinks.map((link) => link.id),
            });
            showSuccessToast("Ordem dos links atualizada!");
        } catch (error: unknown) {
            console.error("Erro ao reordenar links:", error);

            // Reverter a mudança em caso de erro
            setLinks(originalLinks);

            const axiosError = error as {
                response?: { status: number; data?: { message?: string } };
                code?: string;
            };
            if (axiosError.response?.status === 401) {
                toast({
                    title: "Sessão expirada",
                    description: "Sessão expirada. Faça login novamente.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 403) {
                toast({
                    title: "Você não tem permissão para reordenar links.",
                    description: "Você não tem permissão para reordenar links.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 400) {
                toast({
                    title: "Dados inválidos para reordenação",
                    description: "Dados inválidos para reordenação.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status >= 500) {
                toast({
                    title: "Erro interno do servidor",
                    description:
                        "Erro interno do servidor. Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } else if (
                axiosError.code === "NETWORK_ERROR" ||
                !axiosError.response
            ) {
                toast({
                    title: "Erro de conexão",
                    description: "Erro de conexão. Verifique sua internet.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro ao reordenar links",
                    description: "Erro ao reordenar links. Ordem restaurada.",
                    variant: "destructive",
                });
            }
        }
    };

    const getPublicUrl = () => {
        if (!user?.id) return "";
        const baseUrl = window.location.origin;
        return `${baseUrl}/links/${user.id}`;
    };

    const copyPublicUrl = () => {
        const url = getPublicUrl();
        navigator.clipboard.writeText(url);
        showSuccessToast("URL copiada para a área de transferência!");
    };

    const loadAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const data = await analyticsService.getPageAnalytics();
            setAnalytics(data);
        } catch (error: unknown) {
            console.error("Erro ao carregar analytics:", error);

            const axiosError = error as {
                response?: { status: number; data?: { message?: string } };
                code?: string;
            };
            if (axiosError.response?.status === 401) {
                toast({
                    title: "Sessão expirada",
                    description: "Sessão expirada. Faça login novamente.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 403) {
                toast({
                    title: "Você não tem permissão para ver os analytics",
                    description:
                        "Você não tem permissão para ver os analytics.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status >= 500) {
                toast({
                    title: "Erro interno do servidor",
                    description:
                        "Erro interno do servidor. Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } else if (
                axiosError.code === "NETWORK_ERROR" ||
                !axiosError.response
            ) {
                toast({
                    title: "Erro de conexão",
                    description: "Erro de conexão. Verifique sua internet.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro inesperado ao carregar analytics",
                    description: "Erro inesperado ao carregar analytics.",
                    variant: "destructive",
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
            console.error("Erro ao carregar configurações da página:", error);

            const axiosError = error as {
                response?: { status: number; data?: { message?: string } };
                code?: string;
            };
            if (axiosError.response?.status === 401) {
                toast({
                    title: "Sessão expirada",
                    description:
                        "Sessão expirada. Redirecionando para login...",
                    variant: "destructive",
                });
                // O interceptor já vai redirecionar
            } else if (axiosError.response?.status === 403) {
                toast({
                    title: "Você não tem permissão para acessar essas configurações",
                    description:
                        "Você não tem permissão para acessar essas configurações.",
                    variant: "destructive",
                });
            } else {
                // Para outros erros, usar configurações padrão sem mostrar erro
                console.warn(
                    "Usando configurações padrão devido ao erro:",
                    error
                );
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

    // Detectar tamanho da tela para sticky
    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth > 1024);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    const savePageProfile = async (data: LinkPageProfileRequest) => {
        try {
            const updated = await linkPageProfileService.updateLinkPageProfile(
                data
            );
            setPageProfile(updated);
            setPreviewData(updated);
            showSuccessToast("Configurações da página salvas com sucesso!");
        } catch (error: unknown) {
            console.error("Erro ao salvar configurações da página:", error);

            const axiosError = error as {
                response?: { status: number; data?: { message?: string } };
                code?: string;
            };
            if (axiosError.response?.status === 401) {
                toast({
                    title: "Sessão expirada",
                    description: "Sessão expirada. Faça login novamente.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status === 403) {
                toast({
                    title: "Você não tem permissão para alterar essas configurações",
                    description:
                        "Você não tem permissão para alterar essas configurações.",
                    variant: "destructive",
                });
            } else if (axiosError.response?.status >= 500) {
                toast({
                    title: "Erro interno do servidor",
                    description:
                        "Erro interno do servidor. Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } else if (
                axiosError.code === "NETWORK_ERROR" ||
                !axiosError.response
            ) {
                toast({
                    title: "Erro de conexão",
                    description: "Erro de conexão. Verifique sua internet.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Erro inesperado ao salvar configurações",
                    description: "Erro inesperado ao salvar configurações.",
                    variant: "destructive",
                });
            }
        }
    };

    const copySiteColors = async () => {
        try {
            // Buscar as cores do tema do site principal
            const professionalProfile =
                await apiService.getProfessionalProfile();

            // Copiar as cores do site para o preview
            setPreviewData((prev) => ({
                ...prev,
                pagePrimaryColor:
                    professionalProfile.themePrimaryColor || "#3b82f6",
                pageSecondaryColor:
                    professionalProfile.themeSecondaryColor || "#64748b",
                pageBackgroundColor:
                    professionalProfile.themeBackgroundColor || "#ffffff",
                pageSurfaceColor:
                    professionalProfile.themeSurfaceColor || "#f8fafc",
                pageTextPrimaryColor:
                    professionalProfile.themeTextColor || "#1e293b",
                pageTextSecondaryColor:
                    professionalProfile.themeTextSecondaryColor || "#64748b",
                pageBorderColor: "#e2e8f0", // Cor padrão para bordas
                pageHoverColor: "#f1f5f9", // Cor padrão para hover
            }));

            showSuccessToast("Cores do site copiadas com sucesso!");
        } catch (error: unknown) {
            console.error("Erro ao copiar cores do site:", error);
            showErrorToast(
                "Erro ao Copiar Cores",
                "Erro ao copiar cores do site. Tente novamente."
            );
        }
    };

    if (loading) {
        return (
            <ModernLayout title="Meus Links">
                <LoadingState
                    loading={true}
                    loadingText="Carregando seus links..."
                    className="min-h-[400px]"
                />
            </ModernLayout>
        );
    }

    return (
        <ModernLayout title="Meus Links">
            <div className="mylinks-container w-full min-w-0">
                <div className="w-full px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                                Meus Links
                            </h1>
                            <p className="text-gray-600 mt-2 text-sm sm:text-base">
                                Gerencie seus links públicos
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={copyPublicUrl}
                                className="w-full sm:w-auto"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">
                                    Copiar URL Pública
                                </span>
                                <span className="sm:hidden">Copiar URL</span>
                            </Button>

                            <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => setEditingLink(null)}
                                        className="w-full sm:w-auto"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar Link
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="max-w-md mx-4 sm:mx-0">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingLink
                                                ? "Editar Link"
                                                : "Adicionar Link"}
                                        </DialogTitle>
                                    </DialogHeader>

                                    <form
                                        onSubmit={handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <Label htmlFor="title">
                                                Título *{" "}
                                                <span className="text-xs text-gray-500">
                                                    (máx. 100 caracteres)
                                                </span>
                                            </Label>
                                            <Input
                                                id="title"
                                                {...register("title")}
                                                placeholder="Ex: Meu Instagram"
                                                maxLength={100}
                                                className={
                                                    errors.title
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors.title.message}
                                                </p>
                                            )}
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>
                                                    Nome que aparecerá no seu
                                                    link
                                                </span>
                                                <span>
                                                    {watch("title")?.length ||
                                                        0}
                                                    /100
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="description">
                                                Descrição{" "}
                                                <span className="text-xs text-gray-500">
                                                    (opcional, máx. 500
                                                    caracteres)
                                                </span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                {...register("description")}
                                                placeholder="Descrição opcional do link"
                                                rows={2}
                                                maxLength={500}
                                                className={
                                                    errors.description
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors.description.message}
                                                </p>
                                            )}
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>
                                                    Texto que aparecerá abaixo
                                                    do título
                                                </span>
                                                <span>
                                                    {watch("description")
                                                        ?.length || 0}
                                                    /500
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="linkType">
                                                Tipo do Link *
                                            </Label>
                                            <Select
                                                value={watchLinkType}
                                                onValueChange={(value) =>
                                                    setValue(
                                                        "linkType",
                                                        value as LinkType
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="WEBSITE">
                                                        Site/Website
                                                    </SelectItem>
                                                    <SelectItem value="INSTAGRAM">
                                                        Instagram
                                                    </SelectItem>
                                                    <SelectItem value="WHATSAPP">
                                                        WhatsApp
                                                    </SelectItem>
                                                    <SelectItem value="EMAIL">
                                                        Email
                                                    </SelectItem>
                                                    <SelectItem value="PHONE">
                                                        Telefone
                                                    </SelectItem>
                                                    <SelectItem value="YOUTUBE">
                                                        YouTube
                                                    </SelectItem>
                                                    <SelectItem value="LINKEDIN">
                                                        LinkedIn
                                                    </SelectItem>
                                                    <SelectItem value="FACEBOOK">
                                                        Facebook
                                                    </SelectItem>
                                                    <SelectItem value="TIKTOK">
                                                        TikTok
                                                    </SelectItem>
                                                    <SelectItem value="TWITTER">
                                                        X (Twitter)
                                                    </SelectItem>
                                                    <SelectItem value="TELEGRAM">
                                                        Telegram
                                                    </SelectItem>
                                                    <SelectItem value="SOCIAL_MEDIA">
                                                        Outra Rede Social
                                                    </SelectItem>
                                                    <SelectItem value="CUSTOM">
                                                        Personalizado
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="url">URL *</Label>
                                            <Input
                                                id="url"
                                                {...register("url")}
                                                placeholder={
                                                    watchLinkType === "WHATSAPP"
                                                        ? "5511999999999"
                                                        : watchLinkType ===
                                                          "EMAIL"
                                                        ? "seu@email.com"
                                                        : watchLinkType ===
                                                          "PHONE"
                                                        ? "11999999999"
                                                        : "https://exemplo.com"
                                                }
                                                className={
                                                    errors.url
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {errors.url && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    {errors.url.message}
                                                </p>
                                            )}

                                            {/* Dicas de ajuda baseadas no tipo de link */}
                                            {watchLinkType === "WHATSAPP" && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Formato: código do país +
                                                    DDD + número (ex:
                                                    5511999999999)
                                                </p>
                                            )}
                                            {watchLinkType === "EMAIL" && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Formato: usuario@dominio.com
                                                </p>
                                            )}
                                            {watchLinkType === "PHONE" && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Formato: DDD + número (ex:
                                                    11999999999)
                                                </p>
                                            )}
                                            {(watchLinkType === "WEBSITE" ||
                                                watchLinkType ===
                                                    "SOCIAL_MEDIA" ||
                                                watchLinkType === "CUSTOM") && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Formato: https://seusite.com
                                                    (https:// será adicionado
                                                    automaticamente)
                                                </p>
                                            )}
                                        </div>

                                        {watchLinkType === "WHATSAPP" && (
                                            <div>
                                                <Label htmlFor="whatsappMessage">
                                                    Mensagem Padrão{" "}
                                                    <span className="text-xs text-gray-500">
                                                        (opcional, máx. 1000
                                                        caracteres)
                                                    </span>
                                                </Label>
                                                <Textarea
                                                    id="whatsappMessage"
                                                    {...register(
                                                        "whatsappMessage"
                                                    )}
                                                    placeholder="Olá! Vim através do seu link..."
                                                    rows={3}
                                                    maxLength={1000}
                                                    className={
                                                        errors.whatsappMessage
                                                            ? "border-red-500"
                                                            : ""
                                                    }
                                                />
                                                {errors.whatsappMessage && (
                                                    <p className="text-sm text-red-600 mt-1">
                                                        {
                                                            errors
                                                                .whatsappMessage
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                    <span>
                                                        Mensagem que será
                                                        enviada automaticamente
                                                    </span>
                                                    <span>
                                                        {watch(
                                                            "whatsappMessage"
                                                        )?.length || 0}
                                                        /1000
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <Label htmlFor="icon">Ícone</Label>
                                            <Select
                                                value={
                                                    watch("icon") || "default"
                                                }
                                                onValueChange={(value) =>
                                                    setValue(
                                                        "icon",
                                                        value === "default"
                                                            ? ""
                                                            : value
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um ícone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="default">
                                                        Ícone padrão (baseado no
                                                        tipo)
                                                    </SelectItem>
                                                    {availableIcons.map(
                                                        (icon) => (
                                                            <SelectItem
                                                                key={icon.value}
                                                                value={
                                                                    icon.value
                                                                }
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 flex items-center justify-center">
                                                                        {renderIconByValue(
                                                                            icon.value,
                                                                            16,
                                                                            "currentColor"
                                                                        )}
                                                                    </div>
                                                                    {icon.label}
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Escolha o ícone que será exibido
                                                para este link
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="displayAsIcon"
                                                checked={watch("displayAsIcon")}
                                                onCheckedChange={(checked) =>
                                                    setValue(
                                                        "displayAsIcon",
                                                        checked
                                                    )
                                                }
                                            />
                                            <div>
                                                <Label htmlFor="displayAsIcon">
                                                    Exibir como ícone social
                                                </Label>
                                                <p className="text-xs text-gray-500">
                                                    Se ativado, aparece no topo
                                                    como ícone. Se desativado,
                                                    aparece como botão/card
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="isActive"
                                                checked={watch("isActive")}
                                                onCheckedChange={(checked) =>
                                                    setValue(
                                                        "isActive",
                                                        checked
                                                    )
                                                }
                                            />
                                            <Label htmlFor="isActive">
                                                Link ativo
                                            </Label>
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
                                                {isSubmitting
                                                    ? "Salvando..."
                                                    : "Salvar"}
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
                                    <CardTitle className="text-lg">
                                        Sua Página Pública
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <Input
                                            value={getPublicUrl()}
                                            readOnly
                                            className="flex-1 text-xs sm:text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={copyPublicUrl}
                                                className="flex-1 sm:flex-none"
                                            >
                                                Copiar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    window.open(
                                                        getPublicUrl(),
                                                        "_blank"
                                                    )
                                                }
                                                className="flex-1 sm:flex-none"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Lista de Links */}
                            {links.length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <p className="text-gray-500 mb-4">
                                            Nenhum link cadastrado ainda.
                                        </p>
                                        <Button
                                            onClick={() =>
                                                setIsDialogOpen(true)
                                            }
                                        >
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
                                        items={links.map((link) => link.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-1 sm:space-y-2 w-full min-w-0">
                                            {links.map((link) => (
                                                <SortableItem
                                                    key={link.id}
                                                    id={link.id}
                                                >
                                                    {({
                                                        dragHandleProps,
                                                    }: {
                                                        dragHandleProps?: React.RefAttributes<HTMLDivElement> &
                                                            Record<
                                                                string,
                                                                unknown
                                                            >;
                                                    }) => (
                                                        <Card className="hover:shadow-md transition-shadow w-full min-w-0">
                                                            <CardContent className="p-1.5 sm:p-3 w-full min-w-0">
                                                                <div className="flex items-center gap-1.5 sm:gap-3 w-full min-w-0">
                                                                    <div
                                                                        {...dragHandleProps}
                                                                        className="cursor-grab active:cursor-grabbing flex-shrink-0"
                                                                    >
                                                                        <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                                                    </div>

                                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                                        <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                                                            <h3 className="font-semibold truncate text-xs sm:text-sm">
                                                                                {link.title}
                                                                            </h3>
                                                                            <Badge
                                                                                variant={
                                                                                    link.isActive
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                }
                                                                                className="text-xs px-1 py-0 hidden sm:inline-flex"
                                                                            >
                                                                                {link.isActive
                                                                                    ? "Ativo"
                                                                                    : "Inativo"}
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="flex items-center gap-1 sm:gap-2">
                                                                            <p className="text-xs text-gray-500 truncate flex-1">
                                                                                {link.url}
                                                                            </p>
                                                                            <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:inline">
                                                                                {link.clickCount} cliques
                                                                            </span>
                                                                        </div>

                                                                        {link.description && (
                                                                            <p className="text-xs text-gray-600 truncate hidden sm:block">
                                                                                {link.description}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEdit(link);
                                                                            }}
                                                                            className="h-5 w-5 p-0 sm:h-8 sm:w-8"
                                                                        >
                                                                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                        </Button>

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDelete(link.id);
                                                                            }}
                                                                            className="text-red-600 hover:text-red-700 h-5 w-5 p-0 sm:h-8 sm:w-8"
                                                                        >
                                                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {/* Painel de Configurações */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Palette className="w-5 h-5" />
                                                    Personalizar Página de Links
                                                </CardTitle>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Configure a aparência da sua
                                                    página de links pública.
                                                    Estas configurações são
                                                    independentes do seu site
                                                    principal.
                                                </p>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Informações Básicas */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold">
                                                        Informações da Página de
                                                        Links
                                                    </h3>

                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                                        <p className="text-sm text-blue-800">
                                                            <strong>
                                                                Personalização
                                                                Independente:
                                                            </strong>{" "}
                                                            Estas informações
                                                            são específicas para
                                                            sua página de links
                                                            pública. Você pode
                                                            usar dados
                                                            diferentes do seu
                                                            perfil principal do
                                                            site.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="displayName">
                                                            Nome para a página
                                                            de links
                                                        </Label>
                                                        <Input
                                                            id="displayName"
                                                            value={
                                                                previewData?.displayName ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setPreviewData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        displayName:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            placeholder="Nome que aparecerá na sua página de links (pode ser diferente do site)"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Deixe vazio para
                                                            usar o nome do seu
                                                            perfil principal
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="displayTitle">
                                                            Título/Profissão
                                                            para a página de
                                                            links
                                                        </Label>
                                                        <Input
                                                            id="displayTitle"
                                                            value={
                                                                previewData?.displayTitle ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setPreviewData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        displayTitle:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            placeholder="Ex: Nutricionista Especializada em Emagrecimento"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Título específico
                                                            para sua página de
                                                            links (independente
                                                            do site)
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="displayBio">
                                                            Biografia para a
                                                            página de links
                                                        </Label>
                                                        <Textarea
                                                            id="displayBio"
                                                            value={
                                                                previewData?.displayBio ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                setPreviewData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        displayBio:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            placeholder="Descrição específica para sua página de links..."
                                                            rows={3}
                                                            maxLength={500}
                                                        />
                                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                            <span>
                                                                Bio exclusiva
                                                                para a página de
                                                                links
                                                            </span>
                                                            <span>
                                                                {previewData
                                                                    ?.displayBio
                                                                    ?.length ||
                                                                    0}
                                                                /500
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Imagens */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold">
                                                        Imagens da Página de
                                                        Links
                                                    </h3>

                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                                        <p className="text-sm text-green-800">
                                                            <strong>
                                                                Imagens
                                                                Exclusivas:
                                                            </strong>{" "}
                                                            Use imagens
                                                            específicas para sua
                                                            página de links,
                                                            diferentes das do
                                                            seu site principal
                                                            se desejar.
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="displayImageUrl">
                                                            Foto do Perfil para
                                                            a página de links
                                                        </Label>
                                                        <FileUpload
                                                            type="image"
                                                            currentUrl={
                                                                previewData?.displayImageUrl
                                                            }
                                                            field="displayImageUrl"
                                                            onFileSelect={(
                                                                url
                                                            ) =>
                                                                setPreviewData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        displayImageUrl:
                                                                            url,
                                                                    })
                                                                )
                                                            }
                                                            specifications={{
                                                                title: "Foto do Perfil",
                                                                description:
                                                                    "Imagem que aparecerá como foto de perfil na sua página de links",
                                                                dimensions:
                                                                    "400x400 pixels (quadrada)",
                                                                format: "JPG, PNG, WebP",
                                                                maxSize: "5MB",
                                                                tips: [
                                                                    "Use uma foto clara e profissional",
                                                                    "A imagem será cortada em formato circular",
                                                                    "Centralize o rosto na imagem",
                                                                    "Evite fundos muito coloridos ou distraentes",
                                                                ],
                                                            }}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Deixe vazio para
                                                            usar a foto do seu
                                                            perfil principal
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="backgroundImageUrl">
                                                            Imagem de Fundo da
                                                            página de links
                                                        </Label>
                                                        <FileUpload
                                                            type="image"
                                                            currentUrl={
                                                                previewData?.backgroundImageUrl
                                                            }
                                                            field="backgroundImageUrl"
                                                            onFileSelect={(
                                                                url
                                                            ) =>
                                                                setPreviewData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        backgroundImageUrl:
                                                                            url,
                                                                    })
                                                                )
                                                            }
                                                            specifications={{
                                                                title: "Imagem de Fundo",
                                                                description:
                                                                    "Imagem que aparecerá como fundo da sua página de links",
                                                                dimensions:
                                                                    "1080x1920 pixels (vertical mobile)",
                                                                format: "JPG, PNG, WebP",
                                                                maxSize: "10MB",
                                                                tips: [
                                                                    "Use imagens com boa qualidade e resolução",
                                                                    "A imagem será adaptada para diferentes telas",
                                                                    "Evite imagens com muito texto",
                                                                    "Cores mais suaves funcionam melhor como fundo",
                                                                    "A imagem terá uma sobreposição escura para melhor legibilidade",
                                                                ],
                                                            }}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Fundo exclusivo para
                                                            sua página de links
                                                            (opcional)
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Cores */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold">
                                                            Cores da Página de
                                                            Links
                                                        </h3>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={
                                                                copySiteColors
                                                            }
                                                        >
                                                            Copiar cores do site
                                                            principal
                                                        </Button>
                                                    </div>

                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                                        <p className="text-sm text-amber-800">
                                                            <strong>
                                                                Importante:
                                                            </strong>{" "}
                                                            Estas cores são
                                                            exclusivas para sua
                                                            página de links
                                                            pública. Alterar
                                                            aqui não afeta as
                                                            cores do seu site
                                                            principal.
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="pagePrimaryColor">
                                                                Cor Primária dos
                                                                Links
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="pagePrimaryColor"
                                                                    type="color"
                                                                    value={
                                                                        previewData?.pagePrimaryColor ||
                                                                        "#3b82f6"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pagePrimaryColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-12 h-10 p-1"
                                                                />
                                                                <Input
                                                                    value={
                                                                        previewData?.pagePrimaryColor ||
                                                                        "#3b82f6"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pagePrimaryColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    placeholder="#3b82f6"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor principal
                                                                dos botões e
                                                                destaques
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="pageSecondaryColor">
                                                                Cor Secundária
                                                                dos Links
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="pageSecondaryColor"
                                                                    type="color"
                                                                    value={
                                                                        previewData?.pageSecondaryColor ||
                                                                        "#64748b"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageSecondaryColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-12 h-10 p-1"
                                                                />
                                                                <Input
                                                                    value={
                                                                        previewData?.pageSecondaryColor ||
                                                                        "#64748b"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageSecondaryColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    placeholder="#64748b"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor para ícones
                                                                e elementos
                                                                secundários
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="pageBackgroundColor">
                                                                Cor de Fundo da
                                                                Página
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="pageBackgroundColor"
                                                                    type="color"
                                                                    value={
                                                                        previewData?.pageBackgroundColor ||
                                                                        "#ffffff"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageBackgroundColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-12 h-10 p-1"
                                                                />
                                                                <Input
                                                                    value={
                                                                        previewData?.pageBackgroundColor ||
                                                                        "#ffffff"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageBackgroundColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    placeholder="#ffffff"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor de fundo da
                                                                página de links
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="pageSurfaceColor">
                                                                Cor de
                                                                Superfície
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="pageSurfaceColor"
                                                                    type="color"
                                                                    value={
                                                                        previewData?.pageSurfaceColor ||
                                                                        "#f8fafc"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageSurfaceColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-12 h-10 p-1"
                                                                />
                                                                <Input
                                                                    value={
                                                                        previewData?.pageSurfaceColor ||
                                                                        "#f8fafc"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageSurfaceColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    placeholder="#f8fafc"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor para cards e
                                                                superfícies
                                                                elevadas
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="pageTextPrimaryColor">
                                                                Cor do Texto
                                                                Principal
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="pageTextPrimaryColor"
                                                                    type="color"
                                                                    value={
                                                                        previewData?.pageTextPrimaryColor ||
                                                                        "#1e293b"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageTextPrimaryColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-12 h-10 p-1"
                                                                />
                                                                <Input
                                                                    value={
                                                                        previewData?.pageTextPrimaryColor ||
                                                                        "#1e293b"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageTextPrimaryColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    placeholder="#1e293b"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor dos títulos
                                                                e textos
                                                                principais
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="pageTextSecondaryColor">
                                                                Cor do Texto
                                                                Secundário
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="pageTextSecondaryColor"
                                                                    type="color"
                                                                    value={
                                                                        previewData?.pageTextSecondaryColor ||
                                                                        "#64748b"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageTextSecondaryColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-12 h-10 p-1"
                                                                />
                                                                <Input
                                                                    value={
                                                                        previewData?.pageTextSecondaryColor ||
                                                                        "#64748b"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageTextSecondaryColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    placeholder="#64748b"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor para
                                                                subtítulos e
                                                                textos
                                                                secundários
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="pageHoverColor">
                                                                Cor de Hover
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="pageHoverColor"
                                                                    type="color"
                                                                    value={
                                                                        previewData?.pageHoverColor ||
                                                                        "#f1f5f9"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageHoverColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-12 h-10 p-1"
                                                                />
                                                                <Input
                                                                    value={
                                                                        previewData?.pageHoverColor ||
                                                                        "#f1f5f9"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageHoverColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    placeholder="#f1f5f9"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor quando o
                                                                mouse passa
                                                                sobre botões
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor="pageBorderColor">
                                                                Cor das Bordas
                                                            </Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id="pageBorderColor"
                                                                    type="color"
                                                                    value={
                                                                        previewData?.pageBorderColor ||
                                                                        "#e2e8f0"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageBorderColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="w-12 h-10 p-1"
                                                                />
                                                                <Input
                                                                    value={
                                                                        previewData?.pageBorderColor ||
                                                                        "#e2e8f0"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setPreviewData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                pageBorderColor:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    placeholder="#e2e8f0"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor para bordas
                                                                e divisores
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Configurações de Exibição */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold">
                                                        Configurações de
                                                        Exibição
                                                    </h3>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label htmlFor="showProfileImage">
                                                                    Mostrar foto
                                                                    do perfil
                                                                </Label>
                                                                <p className="text-xs text-gray-500">
                                                                    Exibir a
                                                                    imagem do
                                                                    perfil na
                                                                    página
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                id="showProfileImage"
                                                                checked={
                                                                    previewData?.showProfileImage !==
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    setPreviewData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            showProfileImage:
                                                                                checked,
                                                                        })
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label htmlFor="showTitle">
                                                                    Mostrar
                                                                    título/profissão
                                                                </Label>
                                                                <p className="text-xs text-gray-500">
                                                                    Exibir o
                                                                    título
                                                                    abaixo do
                                                                    nome
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                id="showTitle"
                                                                checked={
                                                                    previewData?.showTitle !==
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    setPreviewData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            showTitle:
                                                                                checked,
                                                                        })
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label htmlFor="showBio">
                                                                    Mostrar
                                                                    biografia
                                                                </Label>
                                                                <p className="text-xs text-gray-500">
                                                                    Exibir a
                                                                    descrição na
                                                                    página
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                id="showBio"
                                                                checked={
                                                                    previewData?.showBio !==
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    setPreviewData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            showBio:
                                                                                checked,
                                                                        })
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label htmlFor="isPublic">
                                                                    Página
                                                                    pública
                                                                </Label>
                                                                <p className="text-xs text-gray-500">
                                                                    Permitir
                                                                    acesso
                                                                    público à
                                                                    página
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                id="isPublic"
                                                                checked={
                                                                    previewData?.isPublic !==
                                                                    false
                                                                }
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    setPreviewData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            isPublic:
                                                                                checked,
                                                                        })
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Botões de Ação */}
                                                <div className="flex gap-2 pt-4">
                                                    <Button
                                                        onClick={() =>
                                                            previewData &&
                                                            savePageProfile(
                                                                previewData
                                                            )
                                                        }
                                                        className="flex-1"
                                                    >
                                                        Salvar Alterações
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            setPreviewData(
                                                                pageProfile
                                                            )
                                                        }
                                                        className="flex-1"
                                                    >
                                                        Resetar
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Preview da Página */}
                                    <div
                                        className="preview-sticky w-full"
                                        style={{
                                            position: isLargeScreen
                                                ? "sticky"
                                                : "static",
                                            top: isLargeScreen
                                                ? "1.5rem"
                                                : "auto",
                                            alignSelf: isLargeScreen
                                                ? "flex-start"
                                                : "auto",
                                            height: isLargeScreen
                                                ? "fit-content"
                                                : "auto",
                                            zIndex: isLargeScreen ? 10 : "auto",
                                            maxHeight: isLargeScreen
                                                ? "calc(100vh - 3rem)"
                                                : "none",
                                            overflowY: isLargeScreen
                                                ? "auto"
                                                : "visible",
                                        }}
                                    >
                                        <Card className="overflow-hidden">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-sm">
                                                    <Eye className="w-4 h-4" />
                                                    Preview Mobile
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                {/* Simulação de um iPhone */}
                                                <div className="mobile-preview">
                                                    <div className="mobile-preview-inner">
                                                        {/* Notch do iPhone */}
                                                        <div className="iphone-notch"></div>

                                                        {/* Conteúdo da página */}
                                                        <div className="iphone-content">
                                                            {/* Header with background image */}
                                                            <div className="preview-header">
                                                                <div
                                                                    className="preview-background"
                                                                    style={{
                                                                        backgroundImage:
                                                                            previewData?.backgroundImageUrl
                                                                                ? `url('${previewData.backgroundImageUrl}')`
                                                                                : `linear-gradient(135deg, ${
                                                                                      previewData?.pagePrimaryColor ||
                                                                                      "#667eea"
                                                                                  } 0%, ${
                                                                                      previewData?.pageSecondaryColor ||
                                                                                      "#764ba2"
                                                                                  } 100%)`,
                                                                    }}
                                                                />

                                                                {/* SVG Curve */}
                                                                <div className="preview-curve">
                                                                    <svg
                                                                        viewBox="0 0 1440 120"
                                                                        className="w-full h-6"
                                                                        preserveAspectRatio="none"
                                                                    >
                                                                        <path
                                                                            d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z"
                                                                            fill={
                                                                                previewData?.pageBackgroundColor ||
                                                                                "white"
                                                                            }
                                                                        />
                                                                    </svg>
                                                                </div>

                                                                {/* Profile Picture */}
                                                                {previewData?.showProfileImage !==
                                                                    false && (
                                                                    <div className="preview-profile-picture">
                                                                        <div className="preview-profile-picture-inner">
                                                                            <div
                                                                                className="w-full h-full bg-gray-200 flex items-center justify-center"
                                                                                style={{
                                                                                    backgroundImage:
                                                                                        previewData?.displayImageUrl
                                                                                            ? `url(${previewData.displayImageUrl})`
                                                                                            : undefined,
                                                                                    backgroundSize:
                                                                                        "cover",
                                                                                    backgroundPosition:
                                                                                        "center",
                                                                                }}
                                                                            >
                                                                                {!previewData?.displayImageUrl && (
                                                                                    <span
                                                                                        className="text-lg font-bold text-white"
                                                                                        style={{
                                                                                            color:
                                                                                                previewData?.pagePrimaryColor ||
                                                                                                "#667eea",
                                                                                        }}
                                                                                    >
                                                                                        {(
                                                                                            previewData?.displayName ||
                                                                                            professionalName ||
                                                                                            "U"
                                                                                        )
                                                                                            .charAt(
                                                                                                0
                                                                                            )
                                                                                            .toUpperCase()}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="preview-content">
                                                                <div className="w-full">
                                                                    {/* Name and title */}
                                                                    <div className="preview-name">
                                                                        <h1
                                                                            className="text-lg font-semibold mb-1"
                                                                            style={{
                                                                                color:
                                                                                    previewData?.pageTextPrimaryColor ||
                                                                                    "#111827",
                                                                            }}
                                                                        >
                                                                            {previewData?.displayName ||
                                                                                professionalName ||
                                                                                "Seu Nome"}
                                                                        </h1>
                                                                        {previewData?.displayTitle &&
                                                                            previewData?.showTitle !==
                                                                                false && (
                                                                                <p
                                                                                    className="text-xs font-medium tracking-wider uppercase"
                                                                                    style={{
                                                                                        color:
                                                                                            previewData?.pageTextSecondaryColor ||
                                                                                            "#6b7280",
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        previewData.displayTitle
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                    </div>

                                                                    {/* Bio */}
                                                                    {previewData?.displayBio &&
                                                                        previewData?.showBio !==
                                                                            false && (
                                                                            <div className="preview-bio">
                                                                                <p
                                                                                    className="text-xs leading-relaxed"
                                                                                    style={{
                                                                                        color:
                                                                                            previewData?.pageTextSecondaryColor ||
                                                                                            "#6b7280",
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        previewData.displayBio
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                    {/* Social media icons */}
                                                                    <div className="preview-social-icons">
                                                                        {links
                                                                            .filter(
                                                                                (
                                                                                    link
                                                                                ) =>
                                                                                    link.displayAsIcon &&
                                                                                    link.isActive
                                                                            )
                                                                            .slice(
                                                                                0,
                                                                                4
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    link
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            link.id
                                                                                        }
                                                                                        className="preview-social-icon"
                                                                                    >
                                                                                        {/* Usar ícone personalizado ou baseado no tipo */}
                                                                                        <div
                                                                                            className="preview-social-icon-inner"
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    previewData?.pagePrimaryColor ||
                                                                                                    "#667eea",
                                                                                            }}
                                                                                        >
                                                                                            {renderIconByValue(
                                                                                                link.icon,
                                                                                                14,
                                                                                                "white"
                                                                                            ) ||
                                                                                                renderSocialIcon(
                                                                                                    link.linkType,
                                                                                                    14,
                                                                                                    "white"
                                                                                                )}
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        {links.filter(
                                                                            (
                                                                                link
                                                                            ) =>
                                                                                link.displayAsIcon &&
                                                                                link.isActive
                                                                        )
                                                                            .length ===
                                                                            0 && (
                                                                            <div
                                                                                className="text-xs"
                                                                                style={{
                                                                                    color:
                                                                                        previewData?.pageTextSecondaryColor ||
                                                                                        "#6b7280",
                                                                                }}
                                                                            >
                                                                                Links
                                                                                como
                                                                                ícones
                                                                                aparecerão
                                                                                aqui
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Action buttons */}
                                                                    <div className="preview-action-buttons">
                                                                        {links
                                                                            .filter(
                                                                                (
                                                                                    link
                                                                                ) =>
                                                                                    !link.displayAsIcon &&
                                                                                    link.isActive
                                                                            )
                                                                            .slice(
                                                                                0,
                                                                                3
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    link
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            link.id
                                                                                        }
                                                                                        className="preview-action-button"
                                                                                        style={{
                                                                                            backgroundColor:
                                                                                                previewData?.pagePrimaryColor ||
                                                                                                "#667eea",
                                                                                            color: "#ffffff",
                                                                                        }}
                                                                                        onMouseEnter={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.currentTarget.style.backgroundColor =
                                                                                                previewData?.pageHoverColor ||
                                                                                                "#5a67d8";
                                                                                        }}
                                                                                        onMouseLeave={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.currentTarget.style.backgroundColor =
                                                                                                previewData?.pagePrimaryColor ||
                                                                                                "#667eea";
                                                                                        }}
                                                                                    >
                                                                                        {renderIconByValue(
                                                                                            link.icon,
                                                                                            12,
                                                                                            "white"
                                                                                        ) && (
                                                                                            <div className="flex items-center">
                                                                                                {renderIconByValue(
                                                                                                    link.icon,
                                                                                                    12,
                                                                                                    "white"
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                        <span className="text-balance leading-tight">
                                                                                            {
                                                                                                link.title
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                )
                                                                            )}

                                                                        {links.filter(
                                                                            (
                                                                                link
                                                                            ) =>
                                                                                !link.displayAsIcon &&
                                                                                link.isActive
                                                                        )
                                                                            .length ===
                                                                            0 && (
                                                                            <div className="text-center py-6">
                                                                                <p
                                                                                    className="text-xs"
                                                                                    style={{
                                                                                        color:
                                                                                            previewData?.pageTextSecondaryColor ||
                                                                                            "#6b7280",
                                                                                    }}
                                                                                >
                                                                                    Links
                                                                                    como
                                                                                    botões
                                                                                    aparecerão
                                                                                    aqui
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Barra inferior do iPhone */}
                                                        <div className="iphone-bottom-bar">
                                                            <div className="iphone-home-indicator"></div>
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
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                        <Card>
                                            <CardContent className="p-3 sm:p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center">
                                                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-2 sm:mb-0" />
                                                    <div className="sm:ml-4">
                                                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                                                            Total de
                                                            Visualizações
                                                        </p>
                                                        <p className="text-lg sm:text-2xl font-bold">
                                                            {
                                                                analytics.totalViews
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-3 sm:p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center">
                                                    <ExternalLink className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-2 sm:mb-0" />
                                                    <div className="sm:ml-4">
                                                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                                                            Total de Cliques
                                                        </p>
                                                        <p className="text-lg sm:text-2xl font-bold">
                                                            {
                                                                analytics.totalClicks
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-3 sm:p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center">
                                                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-2 sm:mb-0" />
                                                    <div className="sm:ml-4">
                                                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                                                            Taxa de Clique
                                                        </p>
                                                        <p className="text-lg sm:text-2xl font-bold">
                                                            {analytics.totalViews >
                                                            0
                                                                ? (
                                                                      (analytics.totalClicks /
                                                                          analytics.totalViews) *
                                                                      100
                                                                  ).toFixed(1)
                                                                : "0"}
                                                            %
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-3 sm:p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center">
                                                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mb-2 sm:mb-0" />
                                                    <div className="sm:ml-4">
                                                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                                                            Visualizações Únicas
                                                        </p>
                                                        <p className="text-lg sm:text-2xl font-bold">
                                                            {
                                                                analytics.uniqueViews
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Links Mais Clicados */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Links Mais Clicados
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {analytics.topLinks
                                                    .slice(0, 5)
                                                    .map((linkStat, index) => {
                                                        const link = links.find(
                                                            (l) =>
                                                                l.id ===
                                                                linkStat.linkId
                                                        );
                                                        return (
                                                            <div
                                                                key={
                                                                    linkStat.linkId
                                                                }
                                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                            >
                                                                <div className="flex items-center">
                                                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs rounded-full mr-3">
                                                                        {index +
                                                                            1}
                                                                    </span>
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {link?.title ||
                                                                                "Link não encontrado"}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500 truncate max-w-xs">
                                                                            {
                                                                                link?.url
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-lg">
                                                                        {
                                                                            linkStat.totalClicks
                                                                        }
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        cliques
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                {analytics.topLinks.length ===
                                                    0 && (
                                                    <p className="text-center text-gray-500 py-8">
                                                        Nenhum clique registrado
                                                        ainda
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Visualizações por Data */}
                                    {analytics.viewsByDate &&
                                        analytics.viewsByDate.length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>
                                                        Visualizações dos
                                                        Últimos 7 Dias
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        {analytics.viewsByDate
                                                            .slice(-7)
                                                            .map((dayData) => (
                                                                <div
                                                                    key={
                                                                        dayData.date
                                                                    }
                                                                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                                                >
                                                                    <span className="text-sm font-medium">
                                                                        {new Date(
                                                                            dayData.date
                                                                        ).toLocaleDateString(
                                                                            "pt-BR"
                                                                        )}
                                                                    </span>
                                                                    <span className="font-bold">
                                                                        {
                                                                            dayData.views
                                                                        }{" "}
                                                                        visualizações
                                                                    </span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                    {/* Top Links por Cliques */}
                                    {analytics.topLinks &&
                                        analytics.topLinks.length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>
                                                        Performance por Link
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        {analytics.topLinks.map(
                                                            (linkData) => {
                                                                const link =
                                                                    links.find(
                                                                        (l) =>
                                                                            l.id ===
                                                                            linkData.linkId
                                                                    );
                                                                return (
                                                                    <div
                                                                        key={
                                                                            linkData.linkId
                                                                        }
                                                                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                                                    >
                                                                        <span className="text-sm font-medium truncate">
                                                                            {link?.title ||
                                                                                "Link não encontrado"}
                                                                        </span>
                                                                        <span className="font-bold">
                                                                            {
                                                                                linkData.totalClicks
                                                                            }{" "}
                                                                            cliques
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                    {/* Botão para Recarregar */}
                                    <div className="text-center">
                                        <Button
                                            onClick={loadAnalytics}
                                            variant="outline"
                                        >
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            Atualizar Analytics
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            Analytics dos Seus Links
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            Veja estatísticas detalhadas sobre
                                            suas visualizações e cliques
                                        </p>
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
            </div>
        </ModernLayout>
    );
};

export default MyLinks;
