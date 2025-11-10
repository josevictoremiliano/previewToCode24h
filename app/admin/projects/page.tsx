"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  previewUrl?: string
  publishUrl?: string
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  const fetchProjects = useCallback(async () => {
    try {
      console.log('Buscando projetos...', { searchTerm, statusFilter })
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const url = `/api/admin/projects?${params.toString()}`
      console.log('URL da API:', url)

      const response = await fetch(url)
      console.log('Resposta da API:', response.status, response.ok)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erro da API:', errorData)
        throw new Error('Erro ao carregar projetos')
      }

      const data = await response.json()
      console.log('Projetos carregados:', data)
      setProjects(data)
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
      toast.error("Erro ao carregar projetos")
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter])

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    setUpdatingStatus(projectId)
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      toast.success("Status atualizado com sucesso")
      fetchProjects()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error("Erro ao atualizar status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case "PREVIEW":
        return <Badge className="bg-blue-100 text-blue-800">Preview</Badge>
      case "APPROVED":
        return <Badge className="bg-purple-100 text-purple-800">Aprovado</Badge>
      case "REVISION":
        return <Badge className="bg-orange-100 text-orange-800">Revisão</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Finalizado</Badge>
      case "PUBLISHED":
        return <Badge className="bg-indigo-100 text-indigo-800">Publicado</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const statusOptions = [
    { value: "PENDING", label: "Pendente" },
    { value: "PREVIEW", label: "Preview" },
    { value: "APPROVED", label: "Aprovado" },
    { value: "REVISION", label: "Revisão" },
    { value: "COMPLETED", label: "Finalizado" },
    { value: "PUBLISHED", label: "Publicado" },
  ]

  // Verificar sessão do usuário
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(session => {
        console.log('Sessão atual:', session)
        setDebugInfo(`Usuário: ${session?.user?.email || 'Não logado'}, Role: ${session?.user?.role || 'Não definido'}`)
      })
      .catch(err => console.error('Erro ao verificar sessão:', err))
  }, [])

  // Carregar projetos quando a página carrega ou filtros mudam
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Projetos</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os projetos do sistema
        </p>
        {debugInfo && (
          <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
            Debug: {debugInfo}
          </div>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome do projeto ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PREVIEW">Preview</SelectItem>
                <SelectItem value="APPROVED">Aprovado</SelectItem>
                <SelectItem value="REVISION">Revisão</SelectItem>
                <SelectItem value="COMPLETED">Finalizado</SelectItem>
                <SelectItem value="PUBLISHED">Publicado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchProjects} disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                <Icons.search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Projetos */}
      <Card>
        <CardHeader>
          <CardTitle>Projetos ({projects.length})</CardTitle>
          <CardDescription>
            Lista de todos os projetos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum projeto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {project.id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{project.user.name || 'Sem nome'}</p>
                        <p className="text-sm text-muted-foreground">{project.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(project.status)}
                        <Select
                          value={project.status}
                          onValueChange={(value) => updateProjectStatus(project.id, value)}
                          disabled={updatingStatus === project.id}
                        >
                          <SelectTrigger className="w-32 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</p>
                        <p className="text-muted-foreground">
                          {new Date(project.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/projects/${project.id}`}>
                            <Icons.eye className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icons.message className="h-3 w-3" />
                        </Button>
                        {project.previewUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                              <Icons.externalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}