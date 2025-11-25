"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { toast } from "sonner"
import { Layout, Globe, Mail, Phone, Palette, FileText, CheckCircle, AlertCircle, Rocket, Edit } from "lucide-react"

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
          badge: <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Finalizado</Badge>,
        }
      case "PREVIEW":
        return {
          badge: <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Preview Pronto</Badge>,
        }
      case "PENDING":
        return {
          badge: <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Em Análise</Badge>,
        }
      case "PUBLISHED":
        return {
          badge: <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-200">Publicado</Badge>,
        }
      case "APPROVED":
        return {
          badge: <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">Aprovado</Badge>,
        }
      case "REVISION":
        return {
          badge: <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Revisão</Badge>,
        }
      default:
        return {
          badge: <Badge variant="secondary">{status}</Badge>,
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
      <div className="max-w-5xl mx-auto space-y-8 p-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 h-96 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold">Erro ao carregar site</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {error || 'Site não encontrado'}
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/sites">
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Sites
          </Link>
        </Button>
      </div>
    )
  }

  const statusInfo = getStatusInfo(project.status)

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/dashboard/sites">
              <Icons.arrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{project.siteName}</h1>
              {statusInfo.badge}
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Layout className="h-4 w-4" />
              {project.siteType} • Criado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {project.previewUrl && (
            <Button variant="outline" asChild>
              <Link href={project.previewUrl} target="_blank">
                <Icons.eye className="mr-2 h-4 w-4" />
                Ver Preview
              </Link>
            </Button>
          )}
          {project.finalUrl && (
            <Button asChild>
              <Link href={project.finalUrl} target="_blank">
                <Globe className="mr-2 h-4 w-4" />
                Ver Site Online
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna Principal - Informações */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Detalhes do Projeto
              </CardTitle>
              <CardDescription>
                Informações principais sobre o seu site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome do Site</label>
                  <p className="font-medium text-base">{project.siteName}</p>
                </div>

                {project.slogan && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Slogan</label>
                    <p className="font-medium text-base">{project.slogan}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nicho de Mercado</label>
                  <p className="font-medium text-base">{project.niche || 'Não especificado'}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de Site</label>
                  <p className="font-medium text-base">{project.siteType}</p>
                </div>
              </div>

              {project.description && (
                <div className="space-y-1 pt-2 border-t">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição do Projeto</label>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 mt-1">
                    {project.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Identidade Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8">
                {project.primaryColor && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cor Primária</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl shadow-sm border ring-1 ring-black/5"
                        style={{ backgroundColor: project.primaryColor }}
                      ></div>
                      <span className="font-mono text-sm">{project.primaryColor}</span>
                    </div>
                  </div>
                )}

                {project.secondaryColor && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cor Secundária</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl shadow-sm border ring-1 ring-black/5"
                        style={{ backgroundColor: project.secondaryColor }}
                      ></div>
                      <span className="font-mono text-sm">{project.secondaryColor}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {(project.contactEmail || project.contactPhone) && (
            <Card className="border-none shadow-sm bg-white dark:bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  {project.contactEmail && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-white dark:bg-card flex items-center justify-center shadow-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium truncate">{project.contactEmail}</p>
                      </div>
                    </div>
                  )}

                  {project.contactPhone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-white dark:bg-card flex items-center justify-center shadow-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                        <p className="text-sm font-medium">{project.contactPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Lateral - Ações */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-card sticky top-6">
            <CardHeader>
              <CardTitle>Gerenciar Site</CardTitle>
              <CardDescription>
                Ações disponíveis para este projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.status === 'PREVIEW' && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Preview Disponível</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        O preview do seu site está pronto. Você pode aprovar ou solicitar alterações.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button onClick={handleApprove} className="w-full bg-blue-600 hover:bg-blue-700">
                      Aprovar
                    </Button>
                    <Button variant="outline" onClick={handleRequestRevision} className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                      Revisar
                    </Button>
                  </div>
                </div>
              )}

              {project.status === 'COMPLETED' && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <Rocket className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-emerald-900 dark:text-emerald-100">Site Finalizado</h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        Seu site está pronto para ser publicado.
                      </p>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Publicar Agora
                  </Button>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Button variant="outline" className="w-full justify-start h-11" asChild>
                  <Link href={`/dashboard/sites/${project.id}/edit-content`}>
                    <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                    Editar Conteúdo
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-11" asChild>
                  <Link href={`/dashboard/sites/${project.id}/edit-images`}>
                    <Icons.image className="mr-2 h-4 w-4 text-muted-foreground" />
                    Gerenciar Imagens
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}