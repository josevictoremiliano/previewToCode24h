"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useNotifications } from "@/hooks/use-notifications"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { stats, recentProjects, isLoading, error } = useDashboardData()
  const { notifications } = useNotifications()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Finalizado</Badge>
      case "PREVIEW":
        return <Badge className="bg-blue-100 text-blue-800">Preview Pronto</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Em Análise</Badge>
      case "APPROVED":
        return <Badge className="bg-purple-100 text-purple-800">Aprovado</Badge>
      case "PUBLISHED":
        return <Badge className="bg-indigo-100 text-indigo-800">Publicado</Badge>
      case "REVISION":
        return <Badge className="bg-orange-100 text-orange-800">Revisão</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.alertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
            <p className="text-muted-foreground mb-4 text-center">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {session?.user?.name || "Usuário"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua atividade
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Sites
            </CardTitle>
            <Icons.globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSites || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sites criados até agora
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Produção
            </CardTitle>
            <Icons.clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sitesInProduction || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sendo desenvolvidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Finalizados
            </CardTitle>
            <Icons.checkCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalSites || 0) - (stats?.sitesInProduction || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Prontos para uso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Créditos
            </CardTitle>
            <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.creditsAvailable || 0}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Projetos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>
              Seus últimos sites criados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {project.siteName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/sites">
                  Ver Todos os Sites
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/dashboard/criar-site">
                <Icons.plus className="mr-2 h-4 w-4" />
                Criar Novo Site
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/sites">
                <Icons.globe className="mr-2 h-4 w-4" />
                Gerenciar Sites
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/assinatura">
                <Icons.creditCard className="mr-2 h-4 w-4" />
                Plano & Cobrança
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/configuracoes">
                <Icons.settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notificações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Atualizações sobre seus projetos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nenhuma notificação ainda</p>
              </div>
            ) : (
              notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start space-x-4">
                  <div className="flex h-2 w-2 mt-2">
                    {!notification.read && (
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'info' ? 'bg-blue-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'error' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const date = new Date(notification.createdAt)
                        const now = new Date()
                        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
                        
                        if (diffInHours < 1) return 'Agora há pouco'
                        if (diffInHours < 24) return `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
                        
                        const diffInDays = Math.floor(diffInHours / 24)
                        return `Há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
                      })()}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {notifications.length > 0 && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/notificacoes">
                  Ver Todas as Notificações
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}