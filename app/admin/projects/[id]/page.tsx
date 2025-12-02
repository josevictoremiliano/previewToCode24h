"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { PreviewPanel } from "@/components/admin/preview-panel"
import { ProjectHeader } from "@/components/admin/project-header"
import { ProjectBriefingTab } from "@/components/admin/project-briefing-tab"
import { ProjectCopyTab } from "@/components/admin/project-copy-tab"
import { ProjectV0Tab } from "@/components/admin/project-v0-tab"
import { ProjectLogsTab } from "@/components/admin/project-logs-tab"
import { ProjectAdminTab } from "@/components/admin/project-admin-tab"
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
    metadata: Record<string, unknown>
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
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchProject = useCallback(async (id: string, showToast = false) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}`)
      if (!response.ok) throw new Error('Projeto não encontrado')

      const data = await response.json()
      setProject(data)
      setSelectedStatus(data.status)

      if (showToast) {
        toast.success("Dados atualizados com sucesso")
      }
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
      setProject(prev => prev ? { ...prev, status: 'PROCESSING' } : null)
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

  // Handlers para as ações
  const generateCopy = async () => {
    if (!project) return
    try {
      setProcessing('copy')
      const response = await fetch(`/api/admin/projects/${project.id}/generate-copy`, {
        method: 'POST'
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errorData.error || 'Erro ao gerar copy')
      }
      toast.success("Copy gerada com sucesso!")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar copy'
      toast.error(errorMessage)
    } finally {
      setProcessing(null)
    }
  }

  const regenerateCopy = async () => {
    if (!project) return
    try {
      setProcessing('copy-regenerate')
      const response = await fetch(`/api/admin/projects/${project.id}/regenerate-copy`, {
        method: 'POST'
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errorData.error || 'Erro ao regenerar copy')
      }
      toast.success("Copy regenerada com sucesso!")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao regenerar copy'
      toast.error(errorMessage)
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errorData.error || 'Erro ao enviar para cliente')
      }
      toast.success("Projeto enviado para aprovação do cliente!")
      fetchProject(project.id)
    } catch (error) {
      console.error('Erro:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar para cliente'
      toast.error(errorMessage)
    } finally {
      setProcessing(null)
    }
  }

  const assignToMe = async () => {
    if (!project) return
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
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
      <ProjectHeader
        project={project}
        onBack={() => router.push('/admin/projects')}
      />

      <Tabs defaultValue="briefing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="briefing">Briefing</TabsTrigger>
          <TabsTrigger value="copy">Copy</TabsTrigger>
          <TabsTrigger value="html">V0 & HTML</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        {/* Briefing Tab */}
        <TabsContent value="briefing">
          <div className="grid gap-6 lg:grid-cols-2">
            <ProjectBriefingTab
              project={project}
              processing={processing}
              onGenerateCopy={generateCopy}
              onUpdateStatus={updateProjectStatus}
              isUpdating={isUpdating}
              onRefresh={() => fetchProject(project.id, true)}
            />
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
            <ProjectCopyTab
              project={project}
              processing={processing}
              regenerating={false}
              onGenerateCopy={generateCopy}
              onRegenerateCopy={regenerateCopy}
              onUpdateStatus={updateProjectStatus}
              onRefresh={() => fetchProject(project.id)}
            />
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
            <ProjectV0Tab
              project={project}
              processing={processing}
              onApproveForClient={approveForClient}
              onUpdateStatus={updateProjectStatus}
              onRefresh={() => fetchProject(project.id)}
            />
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
          <ProjectLogsTab logs={project.projectLogs} />
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin">
          <div className="grid gap-6 lg:grid-cols-2">
            <ProjectAdminTab
              project={project}
              selectedStatus={selectedStatus}
              adminNotes={adminNotes}
              isUpdating={isUpdating}
              isSendingWebhook={isSendingWebhook}
              onStatusChange={setSelectedStatus}
              onNotesChange={setAdminNotes}
              onUpdateStatus={updateProjectStatus}
              onProcessWithAI={processWithAI}
              onAssignToMe={assignToMe}
            />
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