import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  Users, 
  Clock, 
  TrendingUp,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { ModernLayout } from '@/components/ModernLayout';
import { analyticsService } from '@/services/analyticsService';
import { PageAnalytics, LinkAnalytics } from '@/types/analytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const LinkAnalytics: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics | null>(null);
  const [selectedLinkAnalytics, setSelectedLinkAnalytics] = useState<LinkAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // dias
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const data = await analyticsService.getPageAnalytics(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setPageAnalytics(data);

      // Se houver linkId nos parâmetros, carregar analytics específico do link
      const linkId = searchParams.get('linkId');
      if (linkId) {
        const linkData = await analyticsService.getLinkAnalytics(
          parseInt(linkId),
          startDate.toISOString(),
          endDate.toISOString()
        );
        setSelectedLinkAnalytics(linkData);
        setSelectedTab('link');
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <ModernLayout title="Analytics">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ModernLayout>
    );
  }

  if (!pageAnalytics) {
    return (
      <ModernLayout title="Analytics">
        <div className="text-center py-12">
          <p className="text-gray-500">Não foi possível carregar os dados de analytics.</p>
          <Button onClick={loadAnalytics} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout title="Analytics dos Links">
      <div className="space-y-4 sm:space-y-6">
        {/* Header com filtros - Mobile First */}
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold">Analytics</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Acompanhe o desempenho dos seus links
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="links" className="text-xs sm:text-sm">Links</TabsTrigger>
            <TabsTrigger value="audience" className="text-xs sm:text-sm">Audiência</TabsTrigger>
            {selectedLinkAnalytics && (
              <TabsTrigger value="link" className="text-xs sm:text-sm">Link Específico</TabsTrigger>
            )}
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Cards de estatísticas - Mobile First */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="p-3 sm:p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total de Visualizações
                  </CardTitle>
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-lg sm:text-2xl font-bold">{formatNumber(pageAnalytics.totalViews)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(pageAnalytics.uniqueViews)} únicas
                  </p>
                </CardContent>
              </Card>

              <Card className="p-3 sm:p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total de Cliques
                  </CardTitle>
                  <MousePointer className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-lg sm:text-2xl font-bold">{formatNumber(pageAnalytics.totalClicks)}</div>
                  <p className="text-xs text-muted-foreground">
                    Em todos os links
                  </p>
                </CardContent>
              </Card>

              <Card className="p-3 sm:p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Taxa de Conversão
                  </CardTitle>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-lg sm:text-2xl font-bold">
                    {pageAnalytics.totalViews > 0 
                      ? ((pageAnalytics.totalClicks / pageAnalytics.totalViews) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cliques por visualização
                  </p>
                </CardContent>
              </Card>

              <Card className="p-3 sm:p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Tempo Médio na Página
                  </CardTitle>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="text-lg sm:text-2xl font-bold">
                    {pageAnalytics.averageSessionDuration 
                      ? formatDuration(Math.round(pageAnalytics.averageSessionDuration))
                      : '0:00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sessão média
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de visualizações por data */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Visualizações por Data</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={pageAnalytics.viewsByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#8884d8" 
                      name="Visualizações"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="uniqueViews" 
                      stroke="#82ca9d" 
                      name="Visualizações Únicas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links */}
          <TabsContent value="links" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Performance dos Links</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {pageAnalytics.topLinks.map((link, index) => (
                    <div key={link.linkId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{link.linkTitle}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                          <span>{formatNumber(link.totalClicks)} cliques</span>
                          <span>{formatNumber(link.uniqueClicks)} únicos</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm"
                          onClick={() => {
                            // Navegar para analytics específico do link
                            window.history.pushState(null, '', `?linkId=${link.linkId}`);
                            setSelectedTab('link');
                            loadAnalytics();
                          }}
                        >
                          <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="hidden sm:inline">Analytics</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audiência */}
          <TabsContent value="audience" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Dispositivos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Dispositivos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={Object.entries(pageAnalytics.viewsByDevice).map(([device, count]) => ({
                          name: device,
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(pageAnalytics.viewsByDevice).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Navegadores */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Navegadores</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={Object.entries(pageAnalytics.viewsByBrowser).map(([browser, count]) => ({
                      browser,
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="browser" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Usuários autenticados */}
            {pageAnalytics.authenticatedUsers.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Usuários Autenticados</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-3">
                    {pageAnalytics.authenticatedUsers.map((user) => (
                      <div key={user.userId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded space-y-2 sm:space-y-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">{user.userName}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.userEmail}</p>
                        </div>
                        <div className="text-left sm:text-right text-xs sm:text-sm">
                          <p>{formatNumber(user.totalViews)} visualizações</p>
                          <p>{formatNumber(user.totalClicks)} cliques</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Link Específico */}
          {selectedLinkAnalytics && (
            <TabsContent value="link" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg truncate">{selectedLinkAnalytics.linkTitle}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold">{formatNumber(selectedLinkAnalytics.totalClicks)}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total de Cliques</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold">{formatNumber(selectedLinkAnalytics.uniqueClicks)}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Cliques Únicos</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold">
                        {selectedLinkAnalytics.totalClicks > 0 
                          ? ((selectedLinkAnalytics.uniqueClicks / selectedLinkAnalytics.totalClicks) * 100).toFixed(1)
                          : 0}%
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Únicos</p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={selectedLinkAnalytics.clicksByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#8884d8" 
                        name="Cliques"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="uniqueClicks" 
                        stroke="#82ca9d" 
                        name="Cliques Únicos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ModernLayout>
  );
};

export default LinkAnalytics;
