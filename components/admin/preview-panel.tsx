"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface PreviewPanelProps {
  project: {
    id: string
    name: string
    data: any
    status: string
    previewUrl?: string
    publishUrl?: string
  }
  onRefresh?: () => void
}

export function PreviewPanel({ project, onRefresh }: PreviewPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  
  // Extrair HTML gerado da IA do campo data
  const generatedHtml = project.data?.generatedContent?.html || 
                       project.data?.generatedHtml || 
                       project.data?.htmlContent || 
                       ''
  
  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  }

  const handleDownload = () => {
    if (!generatedHtml) {
      toast.error("Não há HTML gerado para baixar")
      return
    }
    
    const blob = new Blob([generatedHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("HTML baixado com sucesso!")
  }

  const copyHtml = () => {
    if (!generatedHtml) {
      toast.error("Não há HTML para copiar")
      return
    }
    
    navigator.clipboard.writeText(generatedHtml)
    toast.success("HTML copiado para a área de transferência!")
  }

  if (!generatedHtml && !project.previewUrl) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.monitor className="h-5 w-5" />
            Preview do Site
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Icons.fileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Nenhum preview disponível</h3>
              <p className="text-muted-foreground">
                {project.status === 'PROCESSING' ? 
                  'Site sendo processado pela IA...' : 
                  'Execute o processamento de IA para gerar o preview'
                }
              </p>
            </div>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh}>
                <Icons.refresh className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-full'}`}>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icons.monitor className="h-5 w-5" />
              Preview do Site
              <Badge variant="secondary" className="text-xs">
                {project.status}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Seletor de dispositivo */}
              <div className="flex border rounded-md">
                <Button
                  variant={selectedDevice === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDevice('desktop')}
                  className="rounded-r-none border-0"
                >
                  <Icons.monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedDevice === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDevice('tablet')}
                  className="rounded-none border-0"
                >
                  <Icons.tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedDevice === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedDevice('mobile')}
                  className="rounded-l-none border-0"
                >
                  <Icons.smartphone className="h-4 w-4" />
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* Ações */}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Icons.download className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={copyHtml}>
                <Icons.copy className="h-4 w-4" />
              </Button>
              
              {project.previewUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                    <Icons.externalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Icons.minimize className="h-4 w-4" />
                ) : (
                  <Icons.maximize className="h-4 w-4" />
                )}
              </Button>
              
              {isFullscreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                >
                  <Icons.x className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <div className="h-full bg-gray-50 flex items-center justify-center overflow-hidden">
            <div className={`${deviceSizes[selectedDevice]} h-full bg-white shadow-lg transition-all duration-300`}>
              {generatedHtml ? (
                <iframe
                  srcDoc={generatedHtml}
                  className="w-full h-full border-0"
                  title="Preview do Site"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : project.previewUrl ? (
                <iframe
                  src={project.previewUrl}
                  className="w-full h-full border-0"
                  title="Preview do Site"
                />
              ) : project.id ? (
                <iframe
                  src={`/api/preview/${project.id}`}
                  className="w-full h-full border-0"
                  title="Preview do Site"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Icons.loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Carregando preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}