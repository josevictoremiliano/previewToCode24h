import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      )
    }

    const { id: projectId } = await params

    // Buscar o projeto
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        user: true,
      }
    })

    if (!project) {
      return Response.json(
        { error: "Projeto não encontrado" }, 
        { status: 404 }
      )
    }

    // Verificar se o usuário é o dono do projeto
    if (project.user.email !== session.user.email) {
      return Response.json(
        { error: "Não autorizado" }, 
        { status: 403 }
      )
    }

    // Verificar se o projeto pode ser cancelado
    if (project.status !== 'PENDING') {
      return Response.json(
        { error: "Apenas projetos pendentes podem ser cancelados" }, 
        { status: 400 }
      )
    }

    // Cancelar o projeto
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: 'Cancelado pelo usuário',
      }
    })

    // Criar notificação de cancelamento
    await prisma.notification.create({
      data: {
        title: "Projeto cancelado",
        message: `O projeto "${project.name}" foi cancelado com sucesso.`,
        userId: project.userId,
        projectId: projectId,
        type: "INFO",
        read: false
      }
    })

    return Response.json({
      success: true,
      project: updatedProject
    })

  } catch (error) {
    console.error("Erro ao cancelar projeto:", error)
    return Response.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}