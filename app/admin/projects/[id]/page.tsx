"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"
import { PreviewPanel } from "@/components/admin/preview-panel"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  data: any
  status: string
  createdAt: string
  updatedAt: string
  cancelledAt?: string
  cancelReason?: string
  previewUrl?: string
  publishUrl?: string
  user: {
    id: string
    name: string
    email: string
  }
  assignedAdmin?: {
    id: string
    name: string
    email: string
  }
}

interface AdminProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AdminProjectDetailPage({ params }: AdminProjectDetailPageProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSendingWebhook, setIsSendingWebhook] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [projectId, setProjectId] = useState<string>("")

  useEffect(() => {
    async function loadProject() {
      try {
        const resolvedParams = await params
        setProjectId(resolvedParams.id)
        await fetchProject(resolvedParams.id)
      } catch (error) {
        console.error('Erro ao carregar params:', error)
        toast.error('Erro ao carregar projeto')
      }
    }
    loadProject()
  }, [params])

  const fetchProject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}`)
      if (!response.ok) throw new Error('Projeto não encontrado')

      const data = await response.json()
      setProject(data)
      setSelectedStatus(data.status)
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
      toast.error("Erro ao carregar projeto")
      router.push('/admin/projects')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProjectStatus = async () => {
    if (!project || selectedStatus === project.status) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: selectedStatus,
          adminNotes: adminNotes
        })
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      const updatedProject = await response.json()
      setProject(updatedProject)
      setAdminNotes("")
      toast.success("Status atualizado com sucesso")

      // Se aprovado, mostrar opção de reenviar webhook
      if (selectedStatus === 'APPROVED') {
        toast.info("Projeto aprovado! Agora você pode reenviar para geração do site.")
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error("Erro ao atualizar status")
    } finally {
      setIsUpdating(false)
    }
  }

  const processWithAI = async () => {
    if (!project) return

    setIsSendingWebhook(true)
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/process-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na resposta:', errorData)
        throw new Error(`Erro ${response.status}: ${errorData.error || 'Erro desconhecido'}`)
      }

      const result = await response.json()
      toast.success("Processamento com IA iniciado com sucesso!")
      
      // Atualizar o status do projeto
      setProject(prev => prev ? {...prev, status: 'PROCESSING'} : null)
      setSelectedStatus('PROCESSING')
      
      // Recarregar projeto para obter dados atualizados
      setTimeout(() => {
        fetchProject(project.id)
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao processar com IA:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao processar com IA: ${errorMessage}`)
    } finally {
      setIsSendingWebhook(false)
    }
  }

  const assignToMe = async () => {
    if (!project) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao atribuir projeto')

      const updatedProject = await response.json()
      setProject(updatedProject)
      toast.success("Projeto atribuído a você com sucesso")
    } catch (error) {
      console.error('Erro ao atribuir projeto:', error)
      toast.error("Erro ao atribuir projeto")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pendente" },
      PROCESSING: { color: "bg-blue-100 text-blue-800", label: "Processando" },
      PREVIEW: { color: "bg-blue-100 text-blue-800", label: "Preview" },
      APPROVED: { color: "bg-purple-100 text-purple-800", label: "Aprovado" },
      REVISION: { color: "bg-orange-100 text-orange-800", label: "Revisão" },
      COMPLETED: { color: "bg-green-100 text-green-800", label: "Finalizado" },
      PUBLISHED: { color: "bg-indigo-100 text-indigo-800", label: "Publicado" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelado" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-100 text-gray-800", label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const statusOptions = [
    { value: "PENDING", label: "Pendente" },
    { value: "PROCESSING", label: "Processando" },
    { value: "PREVIEW", label: "Preview" },
    { value: "APPROVED", label: "Aprovado" },
    { value: "REVISION", label: "Revisão" },
    { value: "COMPLETED", label: "Finalizado" },
    { value: "PUBLISHED", label: "Publicado" },
    { value: "CANCELLED", label: "Cancelado" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projeto não encontrado</p>
        <Button onClick={() => router.push('/admin/projects')} className="mt-4">
          Voltar para Projetos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/projects')}
            className="mb-2"
          >
            <Icons.arrowLeft className="h-4 w-4 mr-2" />
            Voltar para Projetos
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            Projeto do cliente: {project.user.name || project.user.email}
          </p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(project.status)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coluna de Informações */}
        <div className="space-y-6">
          {/* Informações do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
              <CardDescription>
                Detalhes e dados fornecidos pelo cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Nome do Projeto</h4>
                <p className="text-sm text-muted-foreground">{project.name}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Dados do Projeto</h4>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-64">
                  {JSON.stringify(project.data, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Criado em</h4>
                  <p className="text-muted-foreground">
                    {new Date(project.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Atualizado em</h4>
                  <p className="text-muted-foreground">
                    {new Date(project.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {project.previewUrl && (
                <div>
                  <h4 className="font-medium mb-2">URL de Preview</h4>
                  <div className="flex gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                      {project.previewUrl}
                    </code>
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                        <Icons.externalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {project.publishUrl && (
                <div>
                  <h4 className="font-medium mb-2">URL Publicada</h4>
                  <div className="flex gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                      {project.publishUrl}
                    </code>
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.publishUrl} target="_blank" rel="noopener noreferrer">
                        <Icons.externalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações de Administrador */}
          <Card>
            <CardHeader>
              <CardTitle>Ações do Administrador</CardTitle>
              <CardDescription>
                Gerencie o status do projeto e envie para geração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Aprovação/Rejeição do Projeto */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Alterar Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full">
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

                <div>
                  <label className="text-sm font-medium">Observações do Admin</label>
                  <Textarea
                    placeholder="Adicione observações sobre esta alteração de status (opcional)..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={updateProjectStatus}
                  disabled={isUpdating || selectedStatus === project.status}
                  className="w-full"
                >
                  {isUpdating ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Icons.check className="mr-2 h-4 w-4" />
                      Atualizar Status
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              {/* Processamento com IA */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Processamento com IA</h4>
                  <p className="text-sm text-muted-foreground">
                    Processe o projeto com nossa IA integrada para gerar o site automaticamente
                  </p>
                </div>

                <Alert>
                  <Icons.zap className="h-4 w-4" />
                  <AlertDescription>
                    Como administrador, você pode processar este projeto com IA a qualquer momento, independentemente do status atual.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={processWithAI}
                  disabled={isSendingWebhook}
                  variant="default"
                  className="w-full"
                >
                  {isSendingWebhook ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Processando com IA...
                    </>
                  ) : (
                    <>
                      <Icons.zap className="mr-2 h-4 w-4" />
                      Processar com IA
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">{project.user.name || 'Sem nome'}</h4>
                <p className="text-sm text-muted-foreground">{project.user.email}</p>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                <Icons.message className="mr-2 h-3 w-3" />
                Enviar Mensagem
              </Button>
            </CardContent>
          </Card>

          {/* Atribuição */}
          <Card>
            <CardHeader>
              <CardTitle>Atribuição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.assignedAdmin ? (
                <div>
                  <h4 className="font-medium">Atribuído a:</h4>
                  <div className="mt-1">
                    <p className="font-medium">{project.assignedAdmin.name}</p>
                    <p className="text-sm text-muted-foreground">{project.assignedAdmin.email}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">Projeto não atribuído</p>
                  <Button
                    onClick={assignToMe}
                    disabled={isUpdating}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    {isUpdating ? (
                      <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Icons.user className="mr-2 h-3 w-3" />
                    )}
                    Atribuir a Mim
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline/Histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Status Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(project.status)}
                <p className="text-sm text-muted-foreground">
                  Última atualização: {new Date(project.updatedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna de Preview */}
        <div className="h-[calc(100vh-200px)]">
          <PreviewPanel 
            project={project} 
            onRefresh={() => fetchProject(project.id)} 
          />
        </div>
      </div>
    </div>
  )
}