import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { processProjectWithAI } from "@/lib/ai-processor"

async function handler(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return Response.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id: projectId } = await context.params

    // Buscar o projeto
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

    console.log(`Iniciando processamento de IA para projeto ${projectId}...`)
    
    // Atualizar status para processando
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'PROCESSING',
        updatedAt: new Date()
      }
    })

    // Notificar usuário que o processamento começou
    await prisma.notification.create({
      data: {
        userId: project.userId,
        projectId: project.id,
        type: "PROJECT_PROCESSING",
        title: "Processamento Iniciado",
        message: `Seu projeto "${project.name}" está sendo processado pela nossa IA. Aguarde alguns minutos.`,
      }
    })

    // Processar com IA em background
    processProjectWithAI(project.data, projectId, session.user.id).catch(error => {
      console.error('Erro no processamento em background:', error)
      
      // Em caso de erro, notificar que será processamento manual
      prisma.notification.create({
        data: {
          userId: project.userId,
          projectId: project.id,
          type: "PROJECT_MANUAL",
          title: "Processamento Manual",
          message: `Houve um problema no processamento automático do projeto "${project.name}". Nossa equipe irá processar manualmente.`,
        }
      }).catch(console.error)
    })

    return Response.json({
      success: true,
      message: "Processamento iniciado com sucesso",
      projectId,
      status: "PROCESSING"
    })

  } catch (error) {
    console.error("Erro ao iniciar processamento:", error)
    return Response.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}

export const POST = handler