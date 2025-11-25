"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { useProjects } from "@/hooks/use-projects"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import { Globe, Eye, ExternalLink, Layout, Settings } from "lucide-react"

export default function MeusSitesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [statusFilter, setStatusFilter] = useState("all")

  const { projects, isLoading, error, refetch } = useProjects(debouncedSearchTerm, statusFilter)

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
      case "CANCELLED":
        return {
          badge: <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">Cancelado</Badge>,
        }
      default:
        return {
          badge: <Badge variant="secondary">{status}</Badge>,
        }
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Minhas Landing Pages</h1>
          <p className="text-muted-foreground text-lg">
            Gerencie e acompanhe o status dos seus projetos
          </p>
        </div>
        <Button asChild size="lg" className="shadow-sm hover:shadow-md transition-all">
          <Link href="/dashboard/criar-site">
            <Icons.plus className="mr-2 h-5 w-5" />
            Criar Novo Site
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex-1 relative">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-gray-200 bg-gray-50/50 focus:bg-white transition-colors"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] border-gray-200 bg-gray-50/50 focus:bg-white">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="PENDING">Em Análise</SelectItem>
            <SelectItem value="PREVIEW">Preview Pronto</SelectItem>
            <SelectItem value="COMPLETED">Finalizado</SelectItem>
            <SelectItem value="PUBLISHED">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="pt-4 flex gap-2">
                  <div className="h-9 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <Icons.alertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Erro ao carregar sites</h3>
          <p className="text-muted-foreground text-center max-w-md">{error}</p>
          <Button onClick={() => refetch()} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-card rounded-2xl border border-dashed">
          <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <Globe className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm || statusFilter !== "all" ? "Nenhum resultado encontrado" : "Comece sua jornada digital"}
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca para encontrar o que procura."
              : "Crie sua primeira landing page profissional em minutos com nossa ajuda."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button asChild size="lg">
              <Link href="/dashboard/criar-site">
                Criar Meu Primeiro Site
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((site) => {
            const statusInfo = getStatusInfo(site.status)

            return (
              <Card key={site.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-card flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Layout className="h-6 w-6" />
                    </div>
                    {statusInfo.badge}
                  </div>

                  <div className="mb-6 flex-1">
                    <h3 className="font-semibold text-xl leading-tight mb-2 group-hover:text-primary transition-colors">
                      {site.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Atualizado em {new Date(site.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex gap-3">
                      <Button className="flex-1" variant="outline" asChild>
                        <Link href={`/dashboard/sites/${site.id}/edit`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Gerenciar
                        </Link>
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      {site.previewUrl ? (
                        <Button className="flex-1" variant="secondary" asChild>
                          <Link href={`/dashboard/sites/${site.id}/preview`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </Button>
                      ) : (
                        <Button className="flex-1" variant="secondary" disabled>
                          <Eye className="mr-2 h-4 w-4" />
                          Aguardando
                        </Button>
                      )}

                      {site.finalUrl && (
                        <Button className="flex-1" variant="default" asChild>
                          <Link href={site.finalUrl} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Site
                          </Link>
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