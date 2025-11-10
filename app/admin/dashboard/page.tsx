"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface AdminDashboardData {
  stats: {
    totalUsers: number
    totalProjects: number
    pendingProjects: number
    completedProjects: number
    cancelledProjects: number
  }
  recentProjects: Array<{
    id: string
    name: string
    status: string
    user: { name: string; email: string }
    createdAt: string
  }>
  recentUsers: Array<{
    id: string
    name: string
    email: string
    createdAt: string
    _count: { projects: number }
  }>
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (response.status === 403) {
          toast.error("Acesso negado. Você não tem permissão de administrador.")
          router.push('/dashboard')
          return
        }
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados')
        }

        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (error) {
        console.error('Erro ao carregar dashboard admin:', error)
        toast.error("Erro ao carregar dados do dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
  }, [session, router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case "PREVIEW":
        return <Badge className="bg-blue-100 text-blue-800">Preview</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Finalizado</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
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
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Icons.alertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Não foi possível carregar os dados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, projetos e monitore o sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Icons.users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projetos</CardTitle>
            <Icons.globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Icons.clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{data.stats.pendingProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <Icons.checkCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.completedProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <Icons.x className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.stats.cancelledProjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects & Users */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>Últimos projetos criados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      por {project.user.name || project.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(project.status)}
                    <Button variant="ghost" size="sm">
                      <Icons.eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Recentes</CardTitle>
            <CardDescription>Novos usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'Sem nome'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {user._count.projects} projeto{user._count.projects !== 1 ? 's' : ''}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Icons.eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse rapidamente as funcionalidades administrativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Icons.users className="h-6 w-6" />
              Gerenciar Usuários
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Icons.globe className="h-6 w-6" />
              Gerenciar Projetos
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Icons.messageSquare className="h-6 w-6" />
              Chat & Suporte
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Icons.barChart className="h-6 w-6" />
              Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}