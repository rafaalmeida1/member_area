import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  FileText, 
  Mail, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Calendar,
  Clock,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { dashboardService, DashboardStats as DashboardStatsType } from '@/services/dashboardService'
import { useErrorHandler } from '@/hooks/useErrorHandler'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardStatsProps {
  userRole?: string
}

export function DashboardStats({ userRole }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatTime = (minutes: number | undefined) => {
    if (minutes === undefined) return '0 min';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const professionalStats = [
    {
      title: "Total de Pacientes",
      value: formatNumber(stats?.totalPatients),
      description: `${stats?.activePatients || 0} ativos`,
      icon: Users,
      trend: stats?.totalPatients && stats?.activePatients ? 
        { value: Math.round((stats.activePatients / stats.totalPatients) * 100), isPositive: true } : 
        undefined
    },
    {
      title: "Módulos Criados",
      value: formatNumber(stats?.totalModules),
      description: `${stats?.activeModules || 0} ativos`,
      icon: FileText,
      trend: stats?.totalModules && stats?.activeModules ? 
        { value: Math.round((stats.activeModules / stats.totalModules) * 100), isPositive: true } : 
        undefined
    },
    {
      title: "Convites Enviados",
      value: formatNumber(stats?.totalInvites),
      description: `${stats?.invitesThisMonth || 0} este mês`,
      icon: Mail,
      trend: stats?.totalInvites && stats?.invitesThisMonth ? 
        { value: Math.round((stats.invitesThisMonth / stats.totalInvites) * 100), isPositive: true } : 
        undefined
    },
    {
      title: "Visualizações",
      value: formatNumber(stats?.totalViews),
      description: "Total de acessos",
      icon: Eye,
      trend: undefined
    }
  ]

  const patientStats = [
    {
      title: "Módulos Disponíveis",
      value: formatNumber(stats?.totalModules),
      description: "Conteúdos para estudar",
      icon: FileText,
      trend: undefined
    },
    {
      title: "Módulos Visualizados",
      value: formatNumber(stats?.viewedModules),
      description: "Conteúdos acessados",
      icon: Eye,
      trend: stats?.totalModules && stats?.viewedModules ? 
        { value: Math.round((stats.viewedModules / stats.totalModules) * 100), isPositive: true } : 
        undefined
    },
    {
      title: "Módulos Concluídos",
      value: formatNumber(stats?.completedModules),
      description: "Conteúdos finalizados",
      icon: BarChart3,
      trend: stats?.viewedModules && stats?.completedModules ? 
        { value: Math.round((stats.completedModules / stats.viewedModules) * 100), isPositive: true } : 
        undefined
    },
    {
      title: "Tempo de Estudo",
      value: formatTime(stats?.totalStudyTime),
      description: "Tempo total investido",
      icon: Clock,
      trend: undefined
    }
  ]

  const displayStats = userRole === 'PROFESSIONAL' ? professionalStats : patientStats

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Activity Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart Card */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Visão geral da atividade nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Gráfico de atividade</p>
                <p className="text-xs">Dados em tempo real</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRole === 'PROFESSIONAL' ? (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Criar Novo Módulo
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Convite
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Pacientes
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Analytics
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Continuar Módulo
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Consulta
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Meu Progresso
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">
              {userRole === 'PROFESSIONAL' ? 'Pacientes Recentes' : 'Módulos Recentes'}
            </CardTitle>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {userRole === 'PROFESSIONAL' ? 'P' : 'M'}{item}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {userRole === 'PROFESSIONAL' 
                          ? `Paciente ${item}` 
                          : `Módulo de Nutrição ${item}`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userRole === 'PROFESSIONAL' 
                          ? 'Último acesso há 2h' 
                          : 'Progresso: 75%'
                        }
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Notificações</CardTitle>
            <Badge variant="secondary">3 novas</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'success', message: 'Novo paciente cadastrado', time: '2h' },
                { type: 'info', message: 'Módulo atualizado com sucesso', time: '4h' },
                { type: 'warning', message: 'Lembrete: Consulta amanhã', time: '1d' },
              ].map((notification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={cn(
                    "h-2 w-2 rounded-full mt-2",
                    notification.type === 'success' && "bg-green-500",
                    notification.type === 'info' && "bg-blue-500",
                    notification.type === 'warning' && "bg-yellow-500"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">há {notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
