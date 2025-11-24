"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NotificationsWidget } from "@/components/dashboard/notifications-widget"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useNotifications } from "@/hooks/use-notifications"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useMemo } from "react"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
)

export default function DashboardPage() {
  const { data: session } = useSession()
  const { stats, recentProjects, isLoading, error } = useDashboardData()
  const { notifications } = useNotifications()

  // Process data for charts
  const projectStatusData = useMemo(() => {
    return {
      labels: ['Finalizado', 'Em Produção', 'Pendente'],
      datasets: [
        {
          data: [
            (stats?.totalSites || 0) - (stats?.sitesInProduction || 0),
            stats?.sitesInProduction || 0,
            0 // Mock pending for now if not available in stats
          ],
          backgroundColor: [
            '#3b82f6', // Blue
            '#f97316', // Orange
            '#e5e7eb', // Gray
          ],
          borderWidth: 0,
          cutout: '75%',
        },
      ],
    }
  }, [stats])

  const activityData = useMemo(() => {
    // Group projects by month for the chart
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const currentMonth = new Date().getMonth()
    // Show last 6 months
    const labels = []
    const data = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(currentMonth - i)
      const monthIndex = d.getMonth()
      labels.push(months[monthIndex])

      // Count projects created in this month
      const count = recentProjects.filter(p => {
        const pDate = new Date(p.createdAt)
        return pDate.getMonth() === monthIndex && pDate.getFullYear() === d.getFullYear()
      }).length
      data.push(count)
    }

    return {
      labels,
      datasets: [
        {
          label: 'Sites Criados',
          data: data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
        },
      ],
    }
  }, [recentProjects])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          color: '#9ca3af',
        },
      },
      y: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Icons.alertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground mb-1">Gerencie e acompanhe seus projetos</p>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral do Projeto</h1>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column - Notifications (Was My Tasks) */}
        <div className="lg:col-span-3 space-y-6">
          <NotificationsWidget notifications={notifications} />
        </div>

        {/* Middle Column - Overview & Stats */}
        <div className="lg:col-span-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Projects Overview */}
            <Card className="border-none shadow-sm bg-white rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Status dos Projetos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] relative flex items-center justify-center">
                  <Doughnut
                    data={projectStatusData}
                    options={{
                      cutout: '70%',
                      plugins: { legend: { display: false } }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <span className="text-3xl font-bold">{stats?.totalSites || 0}</span>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Em Produção: {stats?.sitesInProduction || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Finalizados: {(stats?.totalSites || 0) - (stats?.sitesInProduction || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Chart */}
            <Card className="border-none shadow-sm bg-white rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] w-full">
                  <Line data={activityData} options={chartOptions} />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Sites Criados</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{stats?.totalSites || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Projetos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentProjects.slice(0, 3).map((project, index) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-purple-100 text-purple-600' :
                        index === 1 ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                        <Icons.globe className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 mx-8 hidden md:block">
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${project.status === 'COMPLETED' ? 'bg-green-500 w-full' :
                            project.status === 'IN_PROGRESS' ? 'bg-blue-500 w-2/3' :
                              'bg-orange-500 w-1/3'
                            }`}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {project.status === 'COMPLETED' ? 'Pronto' : 'Ativo'}
                      </p>
                      <Button variant="ghost" size="sm" className="h-6 text-xs rounded-full bg-gray-100 hover:bg-gray-200 mt-1" asChild>
                        <Link href={`/dashboard/sites/${project.id}`}>Ver</Link>
                      </Button>
                    </div>
                  </div>
                ))}

                {recentProjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum projeto recente encontrado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Credits */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Actions (Was My Meetings) */}
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-100">
                <Icons.zap className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start h-12 rounded-xl" asChild>
                  <Link href="/dashboard/criar-site">
                    <Icons.plusCircle className="mr-2 h-5 w-5" />
                    Criar Novo Site
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-12 rounded-xl" asChild>
                  <Link href="/dashboard/sites">
                    <Icons.folder className="mr-2 h-5 w-5" />
                    Meus Projetos
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-12 rounded-xl" asChild>
                  <Link href="/dashboard/suporte">
                    <Icons.messageSquare className="mr-2 h-5 w-5" />
                    Suporte
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credits (Was Notifications) */}
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Seus Créditos</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-100" asChild>
                <Link href="/dashboard/assinatura">
                  <Icons.creditCard className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-2xl text-center">
                <p className="text-sm text-muted-foreground mb-1">Disponíveis</p>
                <span className="text-4xl font-bold text-blue-600">{stats?.creditsAvailable || 0}</span>
                <p className="text-xs text-muted-foreground mt-2">
                  Renova em 01/12
                </p>
              </div>
              <Button className="w-full mt-4 rounded-xl" variant="outline" asChild>
                <Link href="/dashboard/assinatura">
                  Gerenciar Assinatura
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}