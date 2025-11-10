import { NextRequest } from "next/server"
import { withAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function handler(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params

    // Obter sessão para identificar o admin atual
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json(
        { error: "Sessão inválida" },
        { status: 401 }
      )
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { 
        user: true,
        assignedAdmin: true
      }
    })

    if (!project) {
      return Response.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    // Atribuir o projeto ao admin atual
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { 
        assignedAdminId: session.user.id,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedAdmin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Criar notificação para o cliente informando sobre a atribuição
    await prisma.notification.create({
      data: {
        title: "Administrador Atribuído",
        message: `O administrador ${updatedProject.assignedAdmin?.name || 'Um administrador'} foi atribuído ao seu projeto "${project.name}" e irá acompanhar o desenvolvimento.`,
        userId: project.userId,
        projectId,
        type: "info"
      }
    })

    return Response.json(updatedProject)

  } catch (error) {
    console.error("Erro ao atribuir projeto:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const PATCH = withAdminAuth(handler)