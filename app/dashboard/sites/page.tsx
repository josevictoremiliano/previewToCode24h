"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import Link from "next/link"
import Image from "next/image"
import { useProjects } from "@/hooks/use-projects"
import { toast } from "sonner"

export default function MeusSitesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  
  const { projects, isLoading, error, refetch } = useProjects(searchTerm, statusFilter)

  const handleCancelProject = async (projectId: string) => {
    if (!confirm("Tem certeza que deseja cancelar este projeto? Esta ação não pode ser desfeita.")) {
      return
    }

    setCancellingId(projectId)
    try {
      const response = await fetch(`/api/projects/${projectId}/cancel`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar projeto')
      }

      toast.success("Projeto cancelado com sucesso")
      refetch()
    } catch (error) {
      console.error('Erro ao cancelar projeto:', error)
      toast.error("Erro ao cancelar projeto. Tente novamente.")
    } finally {
      setCancellingId(null)
    }
  }

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
      case "CANCELLED":
        return { 
          badge: <Badge className="bg-red-100 text-red-800">Cancelado</Badge>,
          color: "text-red-600"
        }
      default:
        return { 
          badge: <Badge variant="secondary">{status}</Badge>,
          color: "text-muted-foreground"
        }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse"></div>
              <CardContent className="p-6 space-y-3">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
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
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar sites</h3>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Landing Pages</h1>
          <p className="text-muted-foreground">
            Gerencie todas as suas landing pages criadas
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/criar-site">
            <Icons.plus className="mr-2 h-4 w-4" />
            Criar Novo Site
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome do site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDING">Em Análise</SelectItem>
            <SelectItem value="PREVIEW">Preview Pronto</SelectItem>
            <SelectItem value="COMPLETED">Finalizado</SelectItem>
            <SelectItem value="PUBLISHED">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Sites */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma landing page encontrada</h3>
            <p className="text-muted-foreground mb-4 text-center">
              {searchTerm || statusFilter !== "all" 
                ? "Tente ajustar os filtros de busca" 
                : "Você ainda não criou nenhum site"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button asChild>
                <Link href="/dashboard/criar-site">
                  Criar Meu Primeiro Site
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((site) => {
            const statusInfo = getStatusInfo(site.status)
            
            return (
              <Card key={site.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-muted">
                  <Image
                    src={site.thumbnailUrl}
                    alt={`Preview do ${site.name}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback para quando a imagem não carregar
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  {!site.thumbnailUrl && (
                    <div className="flex items-center justify-center h-full">
                      <Icons.globe className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{site.name}</CardTitle>
                    {statusInfo.badge}
                  </div>
                  <CardDescription>
                    Criado em {new Date(site.createdAt).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {site.previewUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/sites/${site.id}/preview`}>
                          <Icons.eye className="mr-1 h-3 w-3" />
                          Preview
                        </Link>
                      </Button>
                    )}
                    
                    {site.finalUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={site.finalUrl} target="_blank">
                          <Icons.externalLink className="mr-1 h-3 w-3" />
                          Ver Site
                        </Link>
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/sites/${site.id}/edit`}>
                        <Icons.edit className="mr-1 h-3 w-3" />
                        Admin
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/sites/${site.id}/edit-content`}>
                        <Icons.fileText className="mr-1 h-3 w-3" />
                        Conteúdo
                      </Link>
                    </Button>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/sites/${site.id}/edit-images`}>
                        <Icons.image className="mr-1 h-3 w-3" />
                        Imagens
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Icons.download className="mr-1 h-3 w-3" />
                        Baixar
                      </Button>
                      
                      {site.status === "PENDING" && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelProject(site.id)}
                          disabled={cancellingId === site.id}
                        >
                          {cancellingId === site.id ? (
                            <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Icons.x className="mr-1 h-3 w-3" />
                          )}
                          Cancelar
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      {site.status === "PREVIEW" && (
                        <Button size="sm">
                          Aprovar
                        </Button>
                      )}
                      
                      {site.status === "COMPLETED" && (
                        <Button size="sm">
                          Publicar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}