import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"

// Endpoint para integrações externas atualizarem status de projetos
export async function POST(request: NextRequest) {
  try {
    // Autenticar via API Key
    const authResult = await authenticateApiKey(request)
    
    if (!authResult) {
      return NextResponse.json(
        { error: "API Key inválida ou ausente" },
        { status: 401 }
      )
    }

    const { projectId, status, previewUrl, finalUrl, message } = await request.json()

    if (!projectId || !status) {
      return NextResponse.json(
        { error: "projectId e status são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar projeto
    const updateData: {
      status: string
      previewUrl?: string
      finalUrl?: string
    } = { status }
    if (previewUrl) updateData.previewUrl = previewUrl
    if (finalUrl) updateData.finalUrl = finalUrl

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    })

    // Criar notificação para o usuário
    const notificationData = getNotificationData(status, project.name, message)
    
    await prisma.notification.create({
      data: {
        userId: project.userId,
        projectId: project.id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        read: false
      },
    })

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Status atualizado com sucesso"
    })

  } catch (error) {
    console.error("Erro ao atualizar status do projeto:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

function getNotificationData(status: string, siteName: string, customMessage?: string) {
  switch (status) {
    case "PREVIEW":
      return {
        type: "info",
        title: "Preview disponível!",
        message: customMessage || `O preview do seu site "${siteName}" está pronto para revisão.`
      }
    case "COMPLETED":
      return {
        type: "success",
        title: "Site finalizado!",
        message: customMessage || `Seu site "${siteName}" foi finalizado com sucesso!`
      }
    case "PUBLISHED":
      return {
        type: "success",
        title: "Site publicado!",
        message: customMessage || `Seu site "${siteName}" foi publicado e está no ar!`
      }
    case "REVISION":
      return {
        type: "warning",
        title: "Revisão necessária",
        message: customMessage || `Seu site "${siteName}" precisa de algumas revisões.`
      }
    default:
      return {
        type: "info",
        title: "Status atualizado",
        message: customMessage || `O status do seu site "${siteName}" foi atualizado.`
      }
  }
}