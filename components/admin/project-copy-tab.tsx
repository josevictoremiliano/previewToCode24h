import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface Project {
  id: string
  copy?: string
  copyFeedback?: string
  status: string
}

interface ProjectCopyTabProps {
  project: Project
  processing: string | null
  regenerating: boolean
  onGenerateCopy: () => void
  onRegenerateCopy: () => void
  onUpdateStatus: () => void
  onRefresh: () => void
}

export function ProjectCopyTab({
  project,
  processing,
  regenerating,
  onGenerateCopy,
  onRegenerateCopy,
  onUpdateStatus,
  onRefresh
}: ProjectCopyTabProps) {
  const [editingCopy, setEditingCopy] = useState(false)
  const [editedCopy, setEditedCopy] = useState(project.copy || "")
  const [copyFeedback, setCopyFeedback] = useState(project.copyFeedback || "")

  // Atualizar editedCopy quando project.copy mudar
  useEffect(() => {
    setEditedCopy(project.copy || "")
  }, [project.copy])

  // Atualizar copyFeedback quando project.copyFeedback mudar
  useEffect(() => {
    setCopyFeedback(project.copyFeedback || "")
  }, [project.copyFeedback])

  const saveCopy = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/copy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copy: editedCopy })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ao salvar copy: ${response.status}`)
      }

      setEditingCopy(false)
      onRefresh()
      toast.success("Copy salva com sucesso!")
    } catch (error) {
      console.error('Erro ao salvar copy:', error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar copy")
    }
  }

  const requestCopyRevision = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/request-copy-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: copyFeedback })
      })
      if (!response.ok) throw new Error('Erro ao solicitar revisão')
      setCopyFeedback("")
      onRefresh()
      toast.success("Solicitação de revisão enviada!")
    } catch (error) {
      console.error('Erro ao solicitar revisão:', error)
      toast.error("Erro ao solicitar revisão")
    }
  }

  return (
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
              onClick={onGenerateCopy}
              disabled={processing === 'copy' || processing === 'copy-regenerate'}
            >
              {(processing === 'copy' || processing === 'copy-regenerate') ? (
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
                    <Button variant="outline" size="sm" onClick={onRegenerateCopy} disabled={regenerating || processing === 'copy' || processing === 'copy-regenerate'}>
                      {(regenerating || processing === 'copy' || processing === 'copy-regenerate') ? (
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
              <ScrollArea className="h-[400px]">
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {project.copy}
                </div>
              </ScrollArea>
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
                disabled={!copyFeedback.trim() || processing === 'copy-revision' || processing === 'copy' || processing === 'copy-regenerate'}
                variant="outline"
              >
                {(processing === 'copy-revision' || processing === 'copy' || processing === 'copy-regenerate') ? (
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
                    variant="outline"
                    onClick={onUpdateStatus}
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
  )
}