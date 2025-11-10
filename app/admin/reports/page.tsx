"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface ReportData {
  summary: {
    totalUsers: number
    totalProjects: number
    projectsByStatus: Record<string, number>
    userGrowth: Array<{ month: string; users: number; projects: number }>
  }
  projectsOverTime: Array<{
    date: string
    count: number
  }>
  topUsers: Array<{
    id: string
    name: string
    email: string
    projectCount: number
  }>
}

export default function AdminReportsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [isExporting, setIsExporting] = useState(false)

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/admin/reports?range=${timeRange}`)
      if (response.status === 403) {
        toast.error("Acesso negado. Você não tem permissão de administrador.")
        router.push('/dashboard')
        return
      }
      
      if (!response.ok) {
        throw new Error('Erro ao carregar relatórios')
      }

      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      toast.error("Erro ao carregar relatórios")
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/admin/reports/export?range=${timeRange}`)
      if (!response.ok) throw new Error('Erro ao exportar relatório')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("Relatório exportado com sucesso!")
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      toast.error("Erro ao exportar relatório")
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchReportData()
    }
  }, [session, timeRange])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b'
      case 'PREVIEW': return '#3b82f6'
      case 'APPROVED': return '#8b5cf6'
      case 'COMPLETED': return '#10b981'
      case 'PUBLISHED': return '#6366f1'
      case 'CANCELLED': return '#ef4444'
      default: return '#6b7280'
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

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Icons.alertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Não foi possível carregar os relatórios</p>
        </div>
      </div>
    )
  }

  // Preparar dados para gráficos
  const statusChartData = {
    labels: Object.keys(reportData.summary.projectsByStatus),
    datasets: [{
      data: Object.values(reportData.summary.projectsByStatus),
      backgroundColor: Object.keys(reportData.summary.projectsByStatus).map(status => getStatusColor(status)),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  }

  const growthChartData = {
    labels: reportData.summary.userGrowth.map(item => item.month),
    datasets: [
      {
        label: 'Usuários',
        data: reportData.summary.userGrowth.map(item => item.users),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1
      },
      {
        label: 'Projetos',
        data: reportData.summary.userGrowth.map(item => item.projects),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise de performance e estatísticas do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} disabled={isExporting}>
            {isExporting && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
            <Icons.download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Icons.users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projetos</CardTitle>
            <Icons.globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Icons.trendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.totalUsers > 0 
                ? Math.round((reportData.summary.totalProjects / reportData.summary.totalUsers) * 100) 
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Icons.activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(reportData.summary.projectsByStatus.PENDING || 0) + 
               (reportData.summary.projectsByStatus.PREVIEW || 0) + 
               (reportData.summary.projectsByStatus.APPROVED || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Proporção de projetos por status</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-64 h-64">
              <Doughnut 
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Growth Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento ao Longo do Tempo</CardTitle>
            <CardDescription>Usuários e projetos por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={growthChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true
                    },
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Mais Ativos</CardTitle>
          <CardDescription>Usuários com mais projetos criados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{user.name || 'Sem nome'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {user.projectCount} projeto{user.projectCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}