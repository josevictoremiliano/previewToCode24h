"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"
import { PreviewPanel } from "@/components/admin/preview-panel"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  data: Record<string, unknown>
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
  briefing?: {
    siteName: string
    businessType: string
    description: string
    targetAudience: string
    mainServices: string
    contactInfo: string
    brandColors: string
    style: string
    additionalRequirements?: string
  }
  copy?: string
  copyFeedback?: string
  htmlContent?: string
  htmlFeedback?: string
  notifications?: Array<{
    id: string
    type: string
    message: string
    createdAt: string
    read: boolean
  }>
  projectLogs?: Array<{
    id: string
    action: string
    description: string
    metadata: any
    createdAt: string
    user: {
      name: string | null
      email: string
    }
  }>
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
  
  // Estados para edição de copy e HTML
  const [editingCopy, setEditingCopy] = useState(false)
  const [editedCopy, setEditedCopy] = useState("")
  const [editingHtml, setEditingHtml] = useState(false)
  const [editedHtml, setEditedHtml] = useState("")
  const [copyFeedback, setCopyFeedback] = useState("")
  const [htmlFeedback, setHtmlFeedback] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  const fetchProject = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}`)
      if (!response.ok) throw new Error('Projeto não encontrado')

      const data = await response.json()
      setProject(data)
      setSelectedStatus(data.status)
      setEditedCopy(data.copy || "")
      setEditedHtml(data.htmlContent || "")
      setCopyFeedback(data.copyFeedback || "")
      setHtmlFeedback(data.htmlFeedback || "")
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
      toast.error("Erro ao carregar projeto")
      router.push('/admin/projects')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    async function loadProject() {
      try {
        const resolvedParams = await params
        await fetchProject(resolvedParams.id)
      } catch (error) {
        console.error('Erro ao carregar params:', error)
        toast.error('Erro ao carregar projeto')
      }
    }
    loadProject()
  }, [params, fetchProject])

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

      await response.json()
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

  // Funções para gerenciar Copy
  const generateCopy = async () => {
    if (!project) return
    try {
      setProcessing('copy')
      const response = await fetch(`/api/admin/projects/${project.id}/generate-copy`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Erro ao gerar copy')
      toast.success("Copy gerada com sucesso!")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      toast.error("Erro ao gerar copy")
    } finally {
      setProcessing(null)
    }
  }

  const regenerateCopy = async () => {
    if (!project) return
    try {
      setRegenerating(true)
      const response = await fetch(`/api/admin/projects/${project.id}/regenerate-copy`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Erro ao regenerar copy')
      toast.success("Copy regenerada com sucesso!")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      toast.error("Erro ao regenerar copy")
    } finally {
      setRegenerating(false)
    }
  }

  const saveCopy = async () => {
    if (!project) return
    try {
      setProcessing('save-copy')
      const response = await fetch(`/api/admin/projects/${project.id}/copy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copy: editedCopy })
      })
      if (!response.ok) throw new Error('Erro ao salvar copy')
      toast.success("Copy salva!")
      setEditingCopy(false)
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      toast.error("Erro ao salvar copy")
    } finally {
      setProcessing(null)
    }
  }

  const saveHtml = async () => {
    if (!project) return
    try {
      setProcessing('save-html')
      const response = await fetch(`/api/admin/projects/${project.id}/html`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: editedHtml })
      })
      if (!response.ok) throw new Error('Erro ao salvar HTML')
      toast.success("HTML salvo!")
      setEditingHtml(false)
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      toast.error("Erro ao salvar HTML")
    } finally {
      setProcessing(null)
    }
  }

  const requestCopyRevision = async () => {
    if (!project) return
    try {
      setProcessing('copy-revision')
      const response = await fetch(`/api/admin/projects/${project.id}/request-copy-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: copyFeedback })
      })
      if (!response.ok) throw new Error('Erro ao solicitar revisão')
      toast.success("Revisão solicitada!")
      setCopyFeedback("")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      toast.error("Erro ao solicitar revisão")
    } finally {
      setProcessing(null)
    }
  }

  // Funções para gerenciar HTML
  const generateHtml = async () => {
    if (!project) return
    try {
      setProcessing('html')
      const response = await fetch(`/api/admin/projects/${project.id}/generate-html`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Erro ao gerar HTML')
      toast.success("HTML gerado com sucesso!")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      toast.error("Erro ao gerar HTML")
    } finally {
      setProcessing(null)
    }
  }

  const requestHtmlRevision = async () => {
    if (!project) return
    try {
      setProcessing('html-revision')
      const response = await fetch(`/api/admin/projects/${project.id}/request-html-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: htmlFeedback })
      })
      if (!response.ok) throw new Error('Erro ao solicitar revisão HTML')
      toast.success("Revisão HTML solicitada!")
      setHtmlFeedback("")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      toast.error("Erro ao solicitar revisão HTML")
    } finally {
      setProcessing(null)
    }
  }

  const approveForClient = async () => {
    if (!project) return
    try {
      setProcessing('approve-client')
      const response = await fetch(`/api/admin/projects/${project.id}/approve-for-client`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Erro ao enviar para cliente')
      toast.success("Projeto enviado para aprovação do cliente!")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      toast.error("Erro ao enviar para cliente")
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Aguardando Admin" },
      PROCESSING: { color: "bg-blue-100 text-blue-800", label: "Processando" },
      COPY_READY: { color: "bg-purple-100 text-purple-800", label: "Copy Pronta" },
      COPY_REVISION: { color: "bg-orange-100 text-orange-800", label: "Revisão Copy" },
      HTML_READY: { color: "bg-green-100 text-green-800", label: "HTML Pronto" },
      HTML_REVISION: { color: "bg-red-100 text-red-800", label: "Revisão HTML" },
      PREVIEW: { color: "bg-indigo-100 text-indigo-800", label: "Aguardando Cliente" },
      APPROVED: { color: "bg-green-100 text-green-800", label: "Aprovado" },
      REVISION: { color: "bg-orange-100 text-orange-800", label: "Revisão" },
      COMPLETED: { color: "bg-gray-100 text-gray-800", label: "Finalizado" },
      PUBLISHED: { color: "bg-indigo-100 text-indigo-800", label: "Publicado" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelado" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-100 text-gray-800", label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const statusOptions = [
    { value: "PENDING", label: "Aguardando Admin" },
    { value: "PROCESSING", label: "Processando" },
    { value: "COPY_READY", label: "Copy Pronta" },
    { value: "COPY_REVISION", label: "Revisão Copy" },
    { value: "HTML_READY", label: "HTML Pronto" },
    { value: "HTML_REVISION", label: "Revisão HTML" },
    { value: "PREVIEW", label: "Aguardando Cliente" },
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
      {/* Header */}
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
            Cliente: {project.user.name} ({project.user.email})
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(project.status)}
          {project.previewUrl && (
            <Button variant="outline" asChild>
              <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                <Icons.externalLink className="h-4 w-4 mr-2" />
                Ver Preview
              </a>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="briefing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="briefing">Briefing</TabsTrigger>
          <TabsTrigger value="copy">Copy</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        {/* Briefing Tab */}
        <TabsContent value="briefing">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Briefing do Cliente</CardTitle>
                <CardDescription>
                  Informações fornecidas pelo cliente para criação do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.briefing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium">Nome do Site</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.siteName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tipo de Negócio</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.businessType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Público-Alvo</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.targetAudience}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Estilo Desejado</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.style}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">Descrição</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.description}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">Principais Serviços</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.mainServices}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Informações de Contato</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.contactInfo}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Cores da Marca</Label>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.brandColors}</p>
                      </div>
                      {project.briefing.additionalRequirements && (
                        <div className="col-span-2">
                          <Label className="text-sm font-medium">Requisitos Adicionais</Label>
                          <p className="mt-1 p-2 bg-gray-50 rounded">{project.briefing.additionalRequirements}</p>
                        </div>
                      )}
                    </div>

                    {/* Logo da Empresa */}
                    {project.data?.visualIdentity?.logoUrl && (
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Logo da Empresa</Label>
                        <div className="p-4 bg-gray-50 rounded-lg inline-block">
                          <img 
                            src={project.data.visualIdentity.logoUrl} 
                            alt="Logo da empresa" 
                            className="max-h-24 max-w-48 object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Imagens do Projeto */}
                    {(() => {
                      // Buscar imagens de múltiplas fontes possíveis
                      const images = project.data?.additionalResources?.images || []
                      const processedImages = Array.isArray(images) ? images : []
                      
                      if (processedImages.length === 0) return null
                      
                      return (
                        <div>
                          <Label className="text-sm font-medium mb-3 block">
                            Imagens do Projeto ({processedImages.length})
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {processedImages.map((image: any, index: number) => {
                              // Suportar tanto string quanto objeto
                              const imageUrl = typeof image === 'string' ? image : image.url
                              const imageName = typeof image === 'object' ? image.filename : `Imagem ${index + 1}`
                              const position = typeof image === 'object' ? image.position : 'unassigned'
                              
                              return (
                                <div key={index} className="aspect-square bg-gray-50 rounded-lg overflow-hidden border relative group">
                                  <img 
                                    src={imageUrl} 
                                    alt={imageName}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                  />
                                  {/* Badge de posição */}
                                  {typeof image === 'object' && position !== 'unassigned' && (
                                    <div className="absolute top-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                      {position}
                                    </div>
                                  )}
                                  {/* Nome do arquivo no hover */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {imageName}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Clique nas imagens para visualizar em tamanho completo
                          </p>
                        </div>
                      )
                    })()}

                    {/* Paleta de Cores Visual */}
                    {(project.data?.visualIdentity?.primaryColor || project.data?.visualIdentity?.secondaryColor) && (
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Paleta de Cores</Label>
                        <div className="flex gap-6">
                          {project.data.visualIdentity.primaryColor && (
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded border-2 border-gray-200 shadow-sm"
                                style={{ backgroundColor: project.data.visualIdentity.primaryColor }}
                              />
                              <div>
                                <p className="text-xs text-muted-foreground">Cor Primária</p>
                                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                  {project.data.visualIdentity.primaryColor}
                                </p>
                              </div>
                            </div>
                          )}
                          {project.data.visualIdentity.secondaryColor && (
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded border-2 border-gray-200 shadow-sm"
                                style={{ backgroundColor: project.data.visualIdentity.secondaryColor }}
                              />
                              <div>
                                <p className="text-xs text-muted-foreground">Cor Secundária</p>
                                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                  {project.data.visualIdentity.secondaryColor}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* URLs de Referência */}
                    {project.data?.visualIdentity?.referenceUrls && Array.isArray(project.data.visualIdentity.referenceUrls) && project.data.visualIdentity.referenceUrls.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Sites de Referência</Label>
                        <div className="space-y-2">
                          {project.data.visualIdentity.referenceUrls.map((url: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                              <Icons.externalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline truncate"
                                title={url}
                              >
                                {url}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-medium">Dados do Projeto (JSON)</Label>
                    <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-auto max-h-64">
                      {JSON.stringify(project.data, null, 2)}
                    </pre>
                  </div>
                )}

                <Separator />
                
                <div className="flex gap-4">
                  {project.status === 'PENDING' && (
                    <>
                      <Button 
                        onClick={generateCopy}
                        disabled={processing === 'copy'}
                      >
                        {processing === 'copy' ? (
                          <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Icons.zap className="h-4 w-4 mr-2" />
                        )}
                        Gerar Copy com IA
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => updateProjectStatus()}
                        disabled={isUpdating}
                      >
                        Marcar como Processando
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="h-[calc(100vh-200px)]">
              <PreviewPanel 
                project={project} 
                onRefresh={() => fetchProject(project.id)} 
              />
            </div>
          </div>
        </TabsContent>

        {/* Copy Tab */}
        <TabsContent value="copy">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Copy do Site</CardTitle>
                <CardDescription>
                  Textos e conteúdo gerados pela IA ou editados manualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!project.copy ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Nenhuma copy gerada ainda</p>
                    <Button 
                      onClick={generateCopy}
                      disabled={processing === 'copy'}
                    >
                      {processing === 'copy' ? (
                        <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Icons.zap className="h-4 w-4 mr-2" />
                      )}
                      Gerar Copy com IA
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Conteúdo da Copy</Label>
                      <div className="flex gap-2">
                        {!editingCopy ? (
                          <>
                            <Button variant="outline" size="sm" onClick={regenerateCopy} disabled={regenerating}>
                              {regenerating ? (
                                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Icons.refresh className="h-4 w-4 mr-2" />
                              )}
                              Gerar Novamente
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingCopy(true)}>
                              <Icons.edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setEditingCopy(false)
                                setEditedCopy(project.copy || "")
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={saveCopy}
                              disabled={processing === 'save-copy'}
                            >
                              {processing === 'save-copy' ? (
                                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Icons.check className="h-4 w-4 mr-2" />
                              )}
                              Salvar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {editingCopy ? (
                      <Textarea
                        value={editedCopy}
                        onChange={(e) => setEditedCopy(e.target.value)}
                        className="min-h-[300px]"
                        placeholder="Edite a copy aqui..."
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                        {project.copy}
                      </div>
                    )}

                    <Separator />

                    {/* Feedback para revisão */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Solicitar Alterações à IA</Label>
                      <Textarea
                        value={copyFeedback}
                        onChange={(e) => setCopyFeedback(e.target.value)}
                        placeholder="Descreva as alterações que a IA deve fazer na copy..."
                        className="min-h-[100px]"
                      />
                      <Button 
                        onClick={requestCopyRevision}
                        disabled={!copyFeedback.trim() || processing === 'copy-revision'}
                        variant="outline"
                      >
                        {processing === 'copy-revision' ? (
                          <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Icons.refresh className="h-4 w-4 mr-2" />
                        )}
                        Solicitar Revisão à IA
                      </Button>
                    </div>

                    <Separator />

                    {/* Ações da Copy */}
                    <div className="flex gap-4">
                      {(project.status === 'COPY_READY' || project.status === 'COPY_REVISION') && (
                        <>
                          <Button 
                            onClick={generateHtml}
                            disabled={processing === 'html'}
                          >
                            {processing === 'html' ? (
                              <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Icons.code className="h-4 w-4 mr-2" />
                            )}
                            Gerar HTML
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => updateProjectStatus()}
                          >
                            Marcar para Revisão
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="h-[calc(100vh-200px)]">
              <PreviewPanel 
                project={project} 
                onRefresh={() => fetchProject(project.id)} 
              />
            </div>
          </div>
        </TabsContent>

        {/* HTML Tab */}
        <TabsContent value="html">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>HTML Gerado</CardTitle>
                <CardDescription>
                  Código HTML completo do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!project.htmlContent ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">HTML não gerado ainda</p>
                    {project.copy && (
                      <Button 
                        onClick={generateHtml}
                        disabled={processing === 'html'}
                      >
                        {processing === 'html' ? (
                          <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Icons.code className="h-4 w-4 mr-2" />
                        )}
                        Gerar HTML
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Código HTML</Label>
                      <div className="flex gap-2">
                        {!editingHtml ? (
                          <Button variant="outline" size="sm" onClick={() => setEditingHtml(true)}>
                            <Icons.edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setEditingHtml(false)
                                setEditedHtml(project.htmlContent || "")
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              size="sm"
                              onClick={saveHtml}
                              disabled={processing === 'save-html'}
                            >
                              {processing === 'save-html' ? (
                                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Icons.check className="h-4 w-4 mr-2" />
                              )}
                              Salvar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {editingHtml ? (
                      <Textarea
                        value={editedHtml}
                        onChange={(e) => setEditedHtml(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Edite o código HTML aqui..."
                      />
                    ) : (
                      <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
                          <code>{project.htmlContent.substring(0, 500)}...</code>
                        </pre>
                      </div>
                    )}

                    <Separator />

                    {/* Feedback para revisão HTML */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Solicitar Alterações no HTML</Label>
                      <Textarea
                        value={htmlFeedback}
                        onChange={(e) => setHtmlFeedback(e.target.value)}
                        placeholder="Descreva as alterações que a IA deve fazer no HTML..."
                        className="min-h-[100px]"
                      />
                      <Button 
                        onClick={requestHtmlRevision}
                        disabled={!htmlFeedback.trim() || processing === 'html-revision'}
                        variant="outline"
                      >
                        {processing === 'html-revision' ? (
                          <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Icons.refresh className="h-4 w-4 mr-2" />
                        )}
                        Solicitar Revisão HTML
                      </Button>
                    </div>

                    <Separator />

                    {/* Ações do HTML */}
                    <div className="flex gap-4">
                      {(project.status === 'HTML_READY' || project.status === 'HTML_REVISION') && (
                        <>
                          <Button 
                            onClick={approveForClient}
                            disabled={processing === 'approve-client'}
                          >
                            {processing === 'approve-client' ? (
                              <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Icons.check className="h-4 w-4 mr-2" />
                            )}
                            Enviar para Cliente Aprovar
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => updateProjectStatus()}
                          >
                            Marcar para Revisão HTML
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="h-[calc(100vh-200px)]">
              <PreviewPanel 
                project={project} 
                onRefresh={() => fetchProject(project.id)} 
              />
            </div>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <div className="grid gap-6 lg:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ações</CardTitle>
                <CardDescription>
                  Registro completo de todas as ações realizadas no projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.projectLogs && project.projectLogs.length > 0 ? (
                  <div className="space-y-4">
                    {project.projectLogs.map((log) => (
                      <div key={log.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icons.clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{log.action}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icons.user className="h-3 w-3" />
                          <span>{log.user.name || log.user.email}</span>
                          {log.metadata?.timestamp && (
                            <span>• {log.metadata.timestamp}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icons.fileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma ação registrada ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              {/* Ações de Administrador */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações do Administrador</CardTitle>
                  <CardDescription>
                    Gerencie o status do projeto e envie para geração
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
            </div>

            <div className="h-[calc(100vh-200px)]">
              <PreviewPanel 
                project={project} 
                onRefresh={() => fetchProject(project.id)} 
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}