import { NextRequest } from "next/server"
import { withAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

async function handler(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const projectId = context.params.id
    const body = await request.json()
    
    const { content, isFromAdmin } = body

    if (!content?.trim()) {
      return Response.json(
        { error: "Conteúdo da mensagem é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    })

    if (!project) {
      return Response.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    // Para mensagens de admin, usar um usuário admin genérico
    // Para implementação completa, seria melhor pegar o admin atual da sessão
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      return Response.json(
        { error: "Usuário administrador não encontrado" },
        { status: 500 }
      )
    }

    // Criar a mensagem
    const chatMessage = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        isFromAdmin: Boolean(isFromAdmin),
        projectId,
        userId: isFromAdmin ? adminUser.id : project.userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Criar notificação para o usuário se a mensagem for do admin
    if (isFromAdmin) {
      await prisma.notification.create({
        data: {
          title: "Nova mensagem do suporte",
          message: `Você recebeu uma nova mensagem sobre o projeto "${project.name}".`,
          userId: project.userId,
          projectId,
          type: "INFO"
        }
      })
    }

    return Response.json(chatMessage)
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuth(handler)