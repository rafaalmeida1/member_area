import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LoadingWrapper, InlineLoading } from '@/components/LoadingSpinner';
import { ModernLayout } from '@/components/ModernLayout';
import { 
  ArrowLeft, 
  Plus, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Send, 
  RotateCcw, 
  X, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService, Invite } from '@/services/api';

interface InviteManagementProps {
  professionalName?: string;
}

export function InviteManagement({ 
  professionalName
}: InviteManagementProps) {
  const { toast } = useToast();
  
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expirationDays: 7,
    notes: ''
  });

  // Carregar convites
  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getInvites();
      setInvites(response.content);
    } catch (error) {
      toast({
        title: "Erro ao carregar convites",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      const prefill: Record<string, string | undefined> = {
        name: formData.name,
        phone: formData.phone || undefined,
      };

      if (formData.notes) {
        prefill.notes = formData.notes;
      }

      await apiService.createInvite({
        email: formData.email,
        name: formData.name,
        phone: formData.phone || undefined,
        expirationDays: formData.expirationDays,
        prefill
      });

      toast({
        title: "Convite criado!",
        description: `Convite enviado para ${formData.email}`,
      });

      setShowCreateDialog(false);
      setFormData({ name: '', email: '', phone: '', expirationDays: 7, notes: '' });
      loadInvites();
    } catch (error) {
      toast({
        title: "Erro ao criar convite",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleResendInvite = async (inviteId: number) => {
    try {
      setIsActionLoading(inviteId);
      await apiService.resendInvite(inviteId);
      toast({
        title: "Convite reenviado!",
        description: "O convite foi enviado novamente.",
      });
      loadInvites();
    } catch (error) {
      toast({
        title: "Erro ao reenviar convite",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    try {
      setIsActionLoading(inviteId);
      await apiService.cancelInvite(inviteId);
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso.",
      });
      loadInvites();
    } catch (error) {
      toast({
        title: "Erro ao cancelar convite",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'EXPIRED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'ACCEPTED': return 'Aceito';
      case 'EXPIRED': return 'Expirado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const pendingInvites = invites.filter(invite => invite.status === 'PENDING');
  const acceptedInvites = invites.filter(invite => invite.status === 'ACCEPTED');
  const expiredInvites = invites.filter(invite => invite.status === 'EXPIRED');
  const cancelledInvites = invites.filter(invite => invite.status === 'CANCELLED');

  return (
    <ModernLayout
      title="Gerenciar Convites"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie convites para seus pacientes
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="shadow-md hover:shadow-lg transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Novo Convite
            </Button>
          </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Convite</DialogTitle>
                  <DialogDescription>
                    Envie um convite para um paciente se cadastrar na plataforma
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome completo"
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                        disabled={isCreating}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expirationDays">Expiração (dias)</Label>
                      <Input
                        id="expirationDays"
                        type="number"
                        min="1"
                        max="30"
                        value={formData.expirationDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, expirationDays: parseInt(e.target.value) || 7 }))}
                        disabled={isCreating}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observações adicionais (opcional)"
                      rows={3}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={isCreating}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      <InlineLoading loading={isCreating} loadingText="Criando...">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Convite
                      </InlineLoading>
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

              <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendentes ({pendingInvites.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Aceitos ({acceptedInvites.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Expirados ({expiredInvites.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelados ({cancelledInvites.length})
            </TabsTrigger>
          </TabsList>

          <LoadingWrapper loading={isLoading} loadingMessage="Carregando convites..." card>
            {/* Pending Invites */}
            <TabsContent value="pending" className="space-y-4">
              {pendingInvites.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum convite pendente</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingInvites.map((invite) => (
                    <Card key={invite.id} className="shadow-elegant">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <h3 className="font-semibold">{invite.name}</h3>
                                <p className="text-sm text-muted-foreground">{invite.email}</p>
                              </div>
                            </div>
                            
                            {invite.phone && (
                              <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{invite.phone}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                Expira em: {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            {invite.fullLink && (
                              <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1">Link do convite:</p>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={invite.fullLink}
                                      readOnly
                                      className="text-xs bg-muted px-2 py-1 rounded border flex-1 font-mono"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(invite.fullLink!);
                                        toast({
                                          title: "Link copiado!",
                                          description: "Link do convite copiado para a área de transferência.",
                                        });
                                      }}
                                      className="text-xs"
                                    >
                                      Copiar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              {getStatusIcon(invite.status)}
                              <Badge className={getStatusColor(invite.status)}>
                                {getStatusText(invite.status)}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvite(invite.id)}
                              disabled={isActionLoading === invite.id}
                            >
                              <InlineLoading loading={isActionLoading === invite.id}>
                                <RotateCcw className="w-4 h-4" />
                              </InlineLoading>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelInvite(invite.id)}
                              disabled={isActionLoading === invite.id}
                              className="text-destructive hover:text-destructive"
                            >
                              <InlineLoading loading={isActionLoading === invite.id}>
                                <X className="w-4 h-4" />
                              </InlineLoading>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Accepted Invites */}
            <TabsContent value="accepted" className="space-y-4">
              {acceptedInvites.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum convite aceito ainda</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {acceptedInvites.map((invite) => (
                    <Card key={invite.id} className="shadow-elegant border-green-200 dark:border-green-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <h3 className="font-semibold">{invite.name}</h3>
                                <p className="text-sm text-muted-foreground">{invite.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                Criado em: {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            {invite.fullLink && (
                              <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1">Link do convite:</p>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={invite.fullLink}
                                      readOnly
                                      className="text-xs bg-muted px-2 py-1 rounded border flex-1 font-mono"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(invite.fullLink!);
                                        toast({
                                          title: "Link copiado!",
                                          description: "Link do convite copiado para a área de transferência.",
                                        });
                                      }}
                                      className="text-xs"
                                    >
                                      Copiar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              {getStatusIcon(invite.status)}
                              <Badge className={getStatusColor(invite.status)}>
                                {getStatusText(invite.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Expired Invites */}
            <TabsContent value="expired" className="space-y-4">
              {expiredInvites.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum convite expirado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {expiredInvites.map((invite) => (
                    <Card key={invite.id} className="shadow-elegant border-red-200 dark:border-red-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <h3 className="font-semibold">{invite.name}</h3>
                                <p className="text-sm text-muted-foreground">{invite.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                Expirou em: {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            {invite.fullLink && (
                              <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1">Link do convite:</p>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={invite.fullLink}
                                      readOnly
                                      className="text-xs bg-muted px-2 py-1 rounded border flex-1 font-mono"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(invite.fullLink!);
                                        toast({
                                          title: "Link copiado!",
                                          description: "Link do convite copiado para a área de transferência.",
                                        });
                                      }}
                                      className="text-xs"
                                    >
                                      Copiar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              {getStatusIcon(invite.status)}
                              <Badge className={getStatusColor(invite.status)}>
                                {getStatusText(invite.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Cancelled Invites */}
            <TabsContent value="cancelled" className="space-y-4">
              {cancelledInvites.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <X className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum convite cancelado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {cancelledInvites.map((invite) => (
                    <Card key={invite.id} className="shadow-elegant border-gray-200 dark:border-gray-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <h3 className="font-semibold">{invite.name}</h3>
                                <p className="text-sm text-muted-foreground">{invite.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                Criado em: {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            {invite.fullLink && (
                              <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1">Link do convite:</p>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={invite.fullLink}
                                      readOnly
                                      className="text-xs bg-muted px-2 py-1 rounded border flex-1 font-mono"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(invite.fullLink!);
                                        toast({
                                          title: "Link copiado!",
                                          description: "Link do convite copiado para a área de transferência.",
                                        });
                                      }}
                                      className="text-xs"
                                    >
                                      Copiar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              {getStatusIcon(invite.status)}
                              <Badge className={getStatusColor(invite.status)}>
                                {getStatusText(invite.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </LoadingWrapper>
        </Tabs>
      </ModernLayout>
    );
  }