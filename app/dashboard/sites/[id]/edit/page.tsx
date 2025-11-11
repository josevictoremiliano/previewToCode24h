"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { PreviewPanel } from "@/components/admin/preview-panel"
import Link from "next/link"
import { toast } from "sonner"

interface Project {
  id: string
  siteName: string
  slogan?: string
  status: string
  createdAt: string
  siteType: string
  niche?: string
  primaryColor?: string
  secondaryColor?: string
  contactEmail?: string
  contactPhone?: string
  description?: string
  previewUrl?: string
  finalUrl?: string
}

export default function EditSitePage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProject() {
      try {
        setIsLoading(true)
        
        const response = await fetch(`/api/projects/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Site não encontrado')
          }
          throw new Error('Erro ao carregar site')
        }

        const data = await response.json()
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao buscar projeto:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { 
          badge: <Badge className="bg-green-100 text-green-800">Finalizado</Badge>,
          color: "text-green-600"
        }
      case "PREVIEW":
        return { 
          badge: <Badge className="bg-blue-100 text-blue-800">Preview Pronto</Badge>,
          color: "text-blue-600"
        }
      case "PENDING":
        return { 
          badge: <Badge className="bg-yellow-100 text-yellow-800">Em Análise</Badge>,
          color: "text-yellow-600"
        }
      case "PUBLISHED":
        return { 
          badge: <Badge className="bg-purple-100 text-purple-800">Publicado</Badge>,
          color: "text-purple-600"
        }
      case "APPROVED":
        return { 
          badge: <Badge className="bg-indigo-100 text-indigo-800">Aprovado</Badge>,
          color: "text-indigo-600"
        }
      case "REVISION":
        return { 
          badge: <Badge className="bg-orange-100 text-orange-800">Revisão</Badge>,
          color: "text-orange-600"
        }
      default:
        return { 
          badge: <Badge variant="secondary">{status}</Badge>,
          color: "text-gray-600"
        }
    }
  }

  const handleRequestRevision = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/request-revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Solicitação de revisão via interface'
        })
      })

      if (response.ok) {
        toast.success('Solicitação de revisão enviada!')
        setProject(prev => prev ? { ...prev, status: 'REVISION' } : null)
      } else {
        throw new Error('Erro ao solicitar revisão')
      }
    } catch (error) {
      toast.error('Erro ao solicitar revisão')
      console.error('Erro:', error)
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        toast.success('Site aprovado!')
        setProject(prev => prev ? { ...prev, status: 'APPROVED' } : null)
      } else {
        throw new Error('Erro ao aprovar site')
      }
    } catch (error) {
      toast.error('Erro ao aprovar site')
      console.error('Erro:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/sites">
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/sites">
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.alertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar site</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {error || 'Site não encontrado'}
            </p>
            <Button asChild>
              <Link href="/dashboard/sites">
                Voltar aos Sites
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(project.status)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/sites">
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.siteName}</h1>
            <p className="text-muted-foreground">
              Gerenciar site • Criado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {statusInfo.badge}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coluna de Informações */}
        <div className="space-y-6">
          {/* Informações do Site */}
          <Card>
          <CardHeader>
            <CardTitle>Informações do Site</CardTitle>
            <CardDescription>
              Detalhes e configurações do projeto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome do Site</label>
              <p className="text-sm font-medium">{project.siteName}</p>
            </div>
            
            {project.slogan && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slogan</label>
                <p className="text-sm">{project.slogan}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo</label>
              <p className="text-sm">{project.siteType}</p>
            </div>
            
            {project.niche && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nicho</label>
                <p className="text-sm">{project.niche}</p>
              </div>
            )}
            
            {project.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="text-sm">{project.description}</p>
              </div>
            )}
            
            <div className="flex gap-4">
              {project.primaryColor && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cor Primária</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: project.primaryColor }}
                    ></div>
                    <p className="text-sm">{project.primaryColor}</p>
                  </div>
                </div>
              )}
              
              {project.secondaryColor && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cor Secundária</label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: project.secondaryColor }}
                    ></div>
                    <p className="text-sm">{project.secondaryColor}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Gerencie seu site e solicite alterações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.previewUrl && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={project.previewUrl} target="_blank">
                  <Icons.eye className="mr-2 h-4 w-4" />
                  Ver Preview
                  <Icons.externalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            
            {project.finalUrl && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={project.finalUrl} target="_blank">
                  <Icons.globe className="mr-2 h-4 w-4" />
                  Ver Site Final
                  <Icons.externalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            
            {project.status === 'PREVIEW' && (
              <div className="flex gap-2">
                <Button onClick={handleApprove} className="flex-1">
                  <Icons.checkCircle className="mr-2 h-4 w-4" />
                  Aprovar
                </Button>
                <Button variant="outline" onClick={handleRequestRevision} className="flex-1">
                  <Icons.edit className="mr-2 h-4 w-4" />
                  Solicitar Revisão
                </Button>
              </div>
            )}
            
            {project.status === 'COMPLETED' && (
              <Button className="w-full">
                <Icons.rocket className="mr-2 h-4 w-4" />
                Publicar Site
              </Button>
            )}
            
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/dashboard/sites/${project.id}/edit-content`}>
                <Icons.edit className="mr-2 h-4 w-4" />
                Editar Conteúdo
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full">
              <Icons.download className="mr-2 h-4 w-4" />
              Baixar Arquivos
            </Button>
          </CardContent>
        </Card>

          {/* Contato */}
          {(project.contactEmail || project.contactPhone) && (
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {project.contactEmail && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{project.contactEmail}</p>
                    </div>
                  )}
                  
                  {project.contactPhone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <p className="text-sm">{project.contactPhone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna de Preview */}
        <div className="h-[calc(100vh-200px)]">
          <PreviewPanel 
            project={{
              id: project.id,
              name: project.siteName,
              data: project, // Passar todo o projeto como data 
              status: project.status,
              previewUrl: project.previewUrl,
              publishUrl: project.finalUrl
            }} 
            onRefresh={() => window.location.reload()} 
          />
        </div>
      </div>
    </div>
  )
}