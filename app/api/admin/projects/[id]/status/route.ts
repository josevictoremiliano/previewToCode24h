import { NextRequest } from "next/server"
import { withAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

async function handler(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params
    const body = await request.json()
    
    const { status, adminNotes } = body

    if (!status) {
      return Response.json(
        { error: "Status é obrigatório" },
        { status: 400 }
      )
    }

    // Validar status
    const validStatuses = ['PENDING', 'PREVIEW', 'APPROVED', 'REVISION', 'COMPLETED', 'PUBLISHED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return Response.json(
        { error: 'Status inválido' },
        { status: 400 }
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

    // Atualizar o status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { 
        status,
        updatedAt: new Date(),
        // Se for cancelado, adicionar data e motivo
        ...(status === 'CANCELLED' && {
          cancelledAt: new Date(),
          cancelReason: adminNotes || 'Cancelado pelo administrador'
        })
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

    // Criar notificação para o usuário
    const statusMessages: Record<string, string> = {
      PENDING: "Seu projeto está em análise.",
      PREVIEW: "Seu projeto está pronto para preview!",
      APPROVED: "Seu projeto foi aprovado!",
      REVISION: "Seu projeto precisa de algumas revisões.",
      COMPLETED: "Seu projeto foi finalizado!",
      PUBLISHED: "Seu projeto foi publicado com sucesso!",
      CANCELLED: "Seu projeto foi cancelado."
    }

    const baseMessage = statusMessages[status] || `Status do projeto alterado para: ${status}`
    const fullMessage = adminNotes ? `${baseMessage}\n\nObservações do administrador: ${adminNotes}` : baseMessage

    await prisma.notification.create({
      data: {
        title: "Status do Projeto Atualizado",
        message: fullMessage,
        userId: project.userId,
        projectId,
        type: "project_status_updated"
      }
    })

    return Response.json(updatedProject)
  } catch (error) {
    console.error("Erro ao atualizar status do projeto:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const PATCH = withAdminAuth(handler)