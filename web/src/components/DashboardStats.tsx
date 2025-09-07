import React from 'react'
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
  // Mock data - em produção, estes dados viriam da API
  const professionalStats = [
    {
      title: "Total de Pacientes",
      value: "1,234",
      description: "Pacientes ativos",
      icon: Users,
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: "Módulos Criados",
      value: "89",
      description: "Conteúdos disponíveis",
      icon: FileText,
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: "Convites Enviados",
      value: "156",
      description: "Este mês",
      icon: Mail,
      trend: { value: 23.1, isPositive: true }
    },
    {
      title: "Visualizações",
      value: "12.4k",
      description: "Últimos 30 dias",
      icon: Eye,
      trend: { value: 15.3, isPositive: true }
    }
  ]

  const patientStats = [
    {
      title: "Módulos Concluídos",
      value: "24",
      description: "Conteúdos finalizados",
      icon: FileText,
      trend: { value: 5.2, isPositive: true }
    },
    {
      title: "Progresso Geral",
      value: "78%",
      description: "Do plano nutricional",
      icon: BarChart3,
      trend: { value: 12.1, isPositive: true }
    },
    {
      title: "Dias Ativos",
      value: "45",
      description: "Nos últimos 60 dias",
      icon: Calendar,
      trend: { value: 8.7, isPositive: true }
    },
    {
      title: "Tempo Médio",
      value: "25min",
      description: "Por sessão",
      icon: Clock,
      trend: { value: 3.2, isPositive: false }
    }
  ]

  const stats = userRole === 'PROFESSIONAL' ? professionalStats : patientStats

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
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
