import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

interface ProjectLog {
  id: string
  action: string
  description: string
  createdAt: string
  metadata?: Record<string, unknown>
  user: {
    name: string | null
    email: string
  }
}

interface ProjectLogsTabProps {
  logs?: ProjectLog[]
}

export function ProjectLogsTab({ logs }: ProjectLogsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Ações</CardTitle>
        <CardDescription>
          Registro completo de todas as ações realizadas no projeto
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icons.clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{log.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icons.user className="h-3 w-3" />
                  <span>{log.user.name || log.user.email}</span>
                  {log.metadata?.timestamp && (
                    <span>• {log.metadata.timestamp}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icons.fileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma ação registrada ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}