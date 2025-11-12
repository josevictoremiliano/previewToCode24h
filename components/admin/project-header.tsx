import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"

interface Project {
  id: string
  name: string
  status: string
  previewUrl?: string
  user: {
    name: string
    email: string
  }
}

interface ProjectHeaderProps {
  project: Project
  onBack: () => void
}

export function ProjectHeader({ project, onBack }: ProjectHeaderProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Aguardando Admin" },
      PROCESSING: { color: "bg-blue-100 text-blue-800", label: "Processando" },
      COPY_READY: { color: "bg-purple-100 text-purple-800", label: "Copy Pronta" },
      COPY_REVISION: { color: "bg-orange-100 text-orange-800", label: "Revisão Copy" },
      HTML_READY: { color: "bg-green-100 text-green-800", label: "HTML Pronto" },
      HTML_REVISION: { color: "bg-red-100 text-red-800", label: "Revisão HTML" },
      PREVIEW: { color: "bg-indigo-100 text-indigo-800", label: "Aguardando Cliente" },
      APPROVED: { color: "bg-green-100 text-green-800", label: "Aprovado" },
      REVISION: { color: "bg-orange-100 text-orange-800", label: "Revisão" },
      COMPLETED: { color: "bg-gray-100 text-gray-800", label: "Finalizado" },
      PUBLISHED: { color: "bg-indigo-100 text-indigo-800", label: "Publicado" },
      CANCELLED: { color: "bg-red-100 text-red-800", label: "Cancelado" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-100 text-gray-800", label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-2"
        >
          <Icons.arrowLeft className="h-4 w-4 mr-2" />
          Voltar para Projetos
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground">
          Cliente: {project.user.name} ({project.user.email})
        </p>
      </div>
      <div className="flex items-center gap-4">
        {getStatusBadge(project.status)}
        {project.previewUrl && (
          <Button variant="outline" asChild>
            <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
              <Icons.externalLink className="h-4 w-4 mr-2" />
              Ver Preview
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}