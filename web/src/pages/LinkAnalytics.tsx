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
import { Layout } from '@/components/Layout';
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
      <Layout title="Analytics">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!pageAnalytics) {
    return (
      <Layout title="Analytics">
        <div className="text-center py-12">
          <p className="text-gray-500">Não foi possível carregar os dados de analytics.</p>
          <Button onClick={loadAnalytics} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Analytics dos Links">
      <div className="space-y-6">
        {/* Header com filtros */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Acompanhe o desempenho dos seus links</p>
          </div>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
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

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="audience">Audiência</TabsTrigger>
            {selectedLinkAnalytics && (
              <TabsTrigger value="link">Link Específico</TabsTrigger>
            )}
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Visualizações
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(pageAnalytics.totalViews)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(pageAnalytics.uniqueViews)} únicas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Cliques
                  </CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(pageAnalytics.totalClicks)}</div>
                  <p className="text-xs text-muted-foreground">
                    Em todos os links
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Taxa de Conversão
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pageAnalytics.totalViews > 0 
                      ? ((pageAnalytics.totalClicks / pageAnalytics.totalViews) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cliques por visualização
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tempo Médio na Página
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
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
              <CardHeader>
                <CardTitle>Visualizações por Data</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pageAnalytics.topLinks.map((link, index) => (
                    <div key={link.linkId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{link.linkTitle}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{formatNumber(link.totalClicks)} cliques</span>
                          <span>{formatNumber(link.uniqueClicks)} únicos</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navegar para analytics específico do link
                            window.history.pushState(null, '', `?linkId=${link.linkId}`);
                            setSelectedTab('link');
                            loadAnalytics();
                          }}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audiência */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dispositivos */}
              <Card>
                <CardHeader>
                  <CardTitle>Dispositivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
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
                <CardHeader>
                  <CardTitle>Navegadores</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
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
                <CardHeader>
                  <CardTitle>Usuários Autenticados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pageAnalytics.authenticatedUsers.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-sm text-gray-600">{user.userEmail}</p>
                        </div>
                        <div className="text-right text-sm">
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
            <TabsContent value="link" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedLinkAnalytics.linkTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatNumber(selectedLinkAnalytics.totalClicks)}</p>
                      <p className="text-sm text-gray-600">Total de Cliques</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatNumber(selectedLinkAnalytics.uniqueClicks)}</p>
                      <p className="text-sm text-gray-600">Cliques Únicos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {selectedLinkAnalytics.totalClicks > 0 
                          ? ((selectedLinkAnalytics.uniqueClicks / selectedLinkAnalytics.totalClicks) * 100).toFixed(1)
                          : 0}%
                      </p>
                      <p className="text-sm text-gray-600">Taxa de Únicos</p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
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
    </Layout>
  );
};

export default LinkAnalytics;
