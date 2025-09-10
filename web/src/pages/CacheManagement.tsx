import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  FileText,
  Clock,
  Palette,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { ModernLayout } from '@/components/ModernLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface CacheInfo {
  totalKeys: number;
  userKeys: number;
  moduleKeys: number;
  sessionKeys: number;
  themeKeys: number;
}

export function CacheManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);

  // Verificar se o usuário tem permissão
  if (!user || (user.role !== 'PROFESSIONAL' && user.role !== 'ADMIN')) {
    return (
      <ModernLayout title="Acesso Negado">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Apenas profissionais e administradores podem acessar esta página.
              </p>
            </CardContent>
          </Card>
        </div>
      </ModernLayout>
    );
  }

  // Carregar informações do cache
  const loadCacheInfo = async () => {
    try {
      setIsLoadingInfo(true);
      const info = await apiService.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações do cache:', error);
      toast({
        title: "Erro ao carregar informações",
        description: "Não foi possível carregar as informações do cache.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  // Carregar informações ao montar o componente
  useEffect(() => {
    loadCacheInfo();
  }, []);

  const handleClearAllCache = async () => {
    try {
      setIsClearing(true);
      await apiService.clearCache();
      setLastCleared(new Date());
      await loadCacheInfo(); // Recarregar informações
      
      toast({
        title: "Cache limpo com sucesso",
        description: "Todo o cache do sistema foi limpo. As próximas requisições serão mais lentas até o cache ser reconstruído.",
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        title: "Erro ao limpar cache",
        description: "Não foi possível limpar o cache. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearSpecificCache = async (type: string, clearFunction: () => Promise<void>) => {
    try {
      setIsClearing(true);
      await clearFunction();
      setLastCleared(new Date());
      await loadCacheInfo(); // Recarregar informações
      
      toast({
        title: "Cache limpo com sucesso",
        description: `Cache de ${type} foi limpo com sucesso.`,
      });
    } catch (error) {
      console.error(`Erro ao limpar cache de ${type}:`, error);
      toast({
        title: "Erro ao limpar cache",
        description: `Não foi possível limpar o cache de ${type}. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const formatLastCleared = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ModernLayout title="Gerenciar Cache">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Cache</h1>
            <p className="text-muted-foreground">
              Gerencie o cache do sistema para melhorar a performance
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Redis Cache
          </Badge>
        </div>

        {/* Informações sobre o Cache */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Sobre o Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">O que é o cache?</h4>
                <p className="text-sm text-muted-foreground">
                  O cache armazena dados frequentemente acessados em memória para acelerar as respostas da aplicação.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Quando limpar?</h4>
                <p className="text-sm text-muted-foreground">
                  Limpe o cache quando houver problemas de dados desatualizados ou após atualizações importantes.
                </p>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Atenção</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Limpar o cache pode causar lentidão temporária nas próximas requisições até que o cache seja reconstruído.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações do Cache */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Ações do Cache
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">Limpar Todo o Cache</h4>
                <p className="text-sm text-muted-foreground">
                  Remove todos os dados armazenados no cache Redis
                </p>
                {lastCleared && (
                  <p className="text-xs text-muted-foreground">
                    Última limpeza: {formatLastCleared(lastCleared)}
                  </p>
                )}
              </div>
              <Button
                onClick={handleClearAllCache}
                disabled={isClearing}
                variant="destructive"
                className="flex items-center gap-2"
              >
                {isClearing ? (
                  <>
                    <LoadingSpinner />
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Limpar Todo o Cache
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Cache */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Informações do Cache
              <Button
                variant="outline"
                size="sm"
                onClick={loadCacheInfo}
                disabled={isLoadingInfo}
                className="ml-auto"
              >
                {isLoadingInfo ? (
                  <LoadingSpinner />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cacheInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Database className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium">Total</h4>
                  <p className="text-2xl font-bold text-primary">{cacheInfo.totalKeys}</p>
                  <p className="text-sm text-muted-foreground">Chaves</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium">Usuários</h4>
                  <p className="text-2xl font-bold text-blue-500">{cacheInfo.userKeys}</p>
                  <p className="text-sm text-muted-foreground">Chaves</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium">Módulos</h4>
                  <p className="text-2xl font-bold text-green-500">{cacheInfo.moduleKeys}</p>
                  <p className="text-sm text-muted-foreground">Chaves</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium">Sessões</h4>
                  <p className="text-2xl font-bold text-orange-500">{cacheInfo.sessionKeys}</p>
                  <p className="text-sm text-muted-foreground">Chaves</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Palette className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium">Temas</h4>
                  <p className="text-2xl font-bold text-purple-500">{cacheInfo.themeKeys}</p>
                  <p className="text-sm text-muted-foreground">Chaves</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2">Carregando informações do cache...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limpeza Específica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Limpeza Específica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Cache de Usuários</h4>
                    <p className="text-sm text-muted-foreground">
                      {cacheInfo ? `${cacheInfo.userKeys} chaves` : 'Carregando...'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSpecificCache('usuários', apiService.clearUserCache)}
                  disabled={isClearing}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-medium">Cache de Módulos</h4>
                    <p className="text-sm text-muted-foreground">
                      {cacheInfo ? `${cacheInfo.moduleKeys} chaves` : 'Carregando...'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSpecificCache('módulos', apiService.clearModuleCache)}
                  disabled={isClearing}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Cache de Sessões</h4>
                    <p className="text-sm text-muted-foreground">
                      {cacheInfo ? `${cacheInfo.sessionKeys} chaves` : 'Carregando...'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSpecificCache('sessões', apiService.clearSessionCache)}
                  disabled={isClearing}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Palette className="w-6 h-6 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Cache de Temas</h4>
                    <p className="text-sm text-muted-foreground">
                      {cacheInfo ? `${cacheInfo.themeKeys} chaves` : 'Carregando...'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearSpecificCache('temas', apiService.clearThemeCache)}
                  disabled={isClearing}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}
