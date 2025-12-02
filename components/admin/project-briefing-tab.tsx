import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"
import { useState } from "react"

interface ProjectData {
  visualIdentity?: {
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
    referenceUrls?: string[]
  }
  additionalResources?: {
    images?: Array<{
      url: string
      filename?: string
      position?: string
    } | string>
  }
  content?: {
    videoUrl?: string
  }
  [key: string]: unknown
}

interface Project {
  id: string
  name: string
  data: ProjectData
  status: string
  updatedAt?: string
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
}

interface ProjectBriefingTabProps {
  project: Project
  processing: string | null
  onGenerateCopy: () => void
  onUpdateStatus: () => void
  isUpdating: boolean
  onRefresh: () => Promise<void>
}

export function ProjectBriefingTab({
  project,
  processing,
  onGenerateCopy,
  onUpdateStatus,
  isUpdating,
  onRefresh
}: ProjectBriefingTabProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Briefing do Cliente</CardTitle>
          <CardDescription>
            Informações fornecidas pelo cliente para criação do site
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {project.updatedAt && (
            <span className="text-xs text-muted-foreground">
              Última atualização: {new Date(project.updatedAt).toLocaleString('pt-BR')}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <Icons.refresh className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
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
                          {typeof image === 'object' && position !== 'unassigned' && (
                            <div className="absolute top-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                              {position}
                            </div>
                          )}
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

            {/* Video URL */}
            {project.data?.content?.videoUrl && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Vídeo de Vendas (VSL)</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                  <Icons.video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={project.data.content.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate"
                    title={project.data.content.videoUrl}
                  >
                    {project.data.content.videoUrl}
                  </a>
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
                onClick={onGenerateCopy}
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
                onClick={onUpdateStatus}
                disabled={isUpdating}
              >
                Marcar como Processando
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}