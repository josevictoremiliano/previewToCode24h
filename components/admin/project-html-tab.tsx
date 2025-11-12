import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"
import { ScrollArea } from "../ui/scroll-area"

interface Project {
  id: string
  htmlContent?: string
  htmlFeedback?: string
  copy?: string
  status: string
}

interface ProjectHtmlTabProps {
  project: Project
  processing: string | null
  onGenerateHtml: () => void
  onApproveForClient: () => void
  onUpdateStatus: () => void
  onRefresh: () => void
}

export function ProjectHtmlTab({ 
  project, 
  processing, 
  onGenerateHtml, 
  onApproveForClient, 
  onUpdateStatus,
  onRefresh 
}: ProjectHtmlTabProps) {
  const [editingHtml, setEditingHtml] = useState(false)
  const [editedHtml, setEditedHtml] = useState(project.htmlContent || "")
  const [htmlFeedback, setHtmlFeedback] = useState(project.htmlFeedback || "")

  const saveHtml = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/html`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: editedHtml })
      })
      if (!response.ok) throw new Error('Erro ao salvar HTML')
      setEditingHtml(false)
      onRefresh()
    } catch (error) {
      console.error('Erro ao salvar HTML:', error)
    }
  }

  const requestHtmlRevision = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/request-html-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: htmlFeedback })
      })
      if (!response.ok) throw new Error('Erro ao solicitar revisão HTML')
      setHtmlFeedback("")
      onRefresh()
    } catch (error) {
      console.error('Erro ao solicitar revisão HTML:', error)
    }
  }

  return (
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
                onClick={onGenerateHtml}
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
                  <>
                    <Button variant="outline" size="sm" onClick={onGenerateHtml} disabled={processing === 'html'}>
                      {processing === 'html' ? (
                        <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Icons.refresh className="h-4 w-4 mr-2" />
                      )}
                      Gerar Novamente
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingHtml(true)}>
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
                <ScrollArea className="h-[400px] w-full rounded-md border"> 
                    <Textarea
                        value={editedHtml}
                        onChange={(e) => setEditedHtml(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Edite o código HTML aqui..."
                    />
                </ScrollArea>
            ) : (
                <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                    <ScrollArea className="h-[400px] w-full">
                            <code>{project.htmlContent.substring(0, 500)}...</code>
                    </ScrollArea>
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
                    onClick={onApproveForClient}
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
                    onClick={onUpdateStatus}
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
  )
}