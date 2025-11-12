import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/icons"

interface User {
  id: string
  name: string
  email: string
}

interface Project {
  id: string
  status: string
  user: User
  assignedAdmin?: User
}

interface ProjectAdminTabProps {
  project: Project
  selectedStatus: string
  adminNotes: string
  isUpdating: boolean
  isSendingWebhook: boolean
  onStatusChange: (status: string) => void
  onNotesChange: (notes: string) => void
  onUpdateStatus: () => void
  onProcessWithAI: () => void
  onAssignToMe: () => void
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

export function ProjectAdminTab({
  project,
  selectedStatus,
  adminNotes,
  isUpdating,
  isSendingWebhook,
  onStatusChange,
  onNotesChange,
  onUpdateStatus,
  onProcessWithAI,
  onAssignToMe
}: ProjectAdminTabProps) {
  return (
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
              <Select value={selectedStatus} onValueChange={onStatusChange}>
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
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={onUpdateStatus}
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
              onClick={onProcessWithAI}
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
                onClick={onAssignToMe}
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
  )
}