import { NextRequest } from "next/server"
import { withAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

async function handler(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params

    // Verificar se o projeto existe e está aprovado
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

    if (project.status !== 'APPROVED') {
      return Response.json(
        { error: "Projeto deve estar aprovado para ser enviado ao webhook" },
        { status: 400 }
      )
    }

    // Preparar dados para o webhook
    const webhookData = {
      projectId: project.id,
      projectName: project.name,
      clientEmail: project.user.email,
      clientName: project.user.name,
      projectData: project.data,
      adminId: project.assignedAdmin?.id,
      adminName: project.assignedAdmin?.name,
      timestamp: new Date().toISOString(),
      action: 'generate_site'
    }

    // URL do webhook (pode ser configurável via variável de ambiente)
    const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.SITE_GENERATOR_WEBHOOK_URL || 'https://api.exemplo.com/generate-site'

    console.log('Enviando para webhook:', {
      url: webhookUrl,
      projectId: project.id,
      projectName: project.name
    })

    try {
      // Enviar dados para o webhook
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET_TOKEN}`,
          'X-Source': 'site24h-admin'
        },
        body: JSON.stringify(webhookData),
        signal: AbortSignal.timeout(30000) // Timeout de 30 segundos
      })

      let webhookResult: Record<string, unknown> = {}
      
      if (webhookResponse.ok) {
        try {
          webhookResult = await webhookResponse.json()
        } catch {
          webhookResult = { message: 'Webhook executado com sucesso' }
        }

        // Atualizar o projeto com informações do webhook
        const updateData: Record<string, unknown> = {
          status: 'COMPLETED',
          updatedAt: new Date()
        }

        // Se o webhook retornou uma URL de preview, atualizá-la
        if (webhookResult.previewUrl) {
          updateData.previewUrl = webhookResult.previewUrl
        }

        // Se o webhook retornou uma URL publicada, atualizá-la
        if (webhookResult.publishUrl) {
          updateData.publishUrl = webhookResult.publishUrl
        }

        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: updateData,
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

        // Criar notificação de sucesso
        await prisma.notification.create({
          data: {
            title: "Site Gerado com Sucesso!",
            message: `Seu projeto "${project.name}" foi enviado para geração e o site está sendo criado. Você receberá uma notificação quando estiver pronto.`,
            userId: project.userId,
            projectId,
            type: "success"
          }
        })

        return Response.json({
          success: true,
          message: "Dados enviados para webhook com sucesso",
          webhookResult,
          project: updatedProject,
          previewUrl: webhookResult.previewUrl,
          publishUrl: webhookResult.publishUrl
        })

      } else {
        // Webhook falhou
        const errorText = await webhookResponse.text()
        console.error(`Erro no webhook: ${webhookResponse.status} - ${errorText}`)
        console.error('URL do webhook:', webhookUrl)
        console.error('Dados enviados:', JSON.stringify(webhookData, null, 2))

        // Criar notificação de erro
        await prisma.notification.create({
          data: {
            title: "Erro na Geração do Site",
            message: `Houve um problema ao gerar o site para o projeto "${project.name}". Nossa equipe foi notificada e irá resolver o problema.`,
            userId: project.userId,
            projectId,
            type: "error"
          }
        })

        return Response.json(
          { 
            error: "Erro ao processar webhook",
            details: errorText,
            status: webhookResponse.status,
            webhookUrl: webhookUrl
          },
          { status: 502 }
        )
      }

    } catch (webhookError: unknown) {
      console.error("Erro ao chamar webhook:", webhookError)

      // Verificar se é erro de timeout
      if (webhookError instanceof Error && (webhookError.name === 'TimeoutError' || webhookError.name === 'AbortError')) {
        await prisma.notification.create({
          data: {
            title: "Timeout na Geração do Site",
            message: `O processo de geração do site para o projeto "${project.name}" está demorando mais que o esperado. Aguarde alguns minutos e tente novamente.`,
            userId: project.userId,
            projectId,
            type: "warning"
          }
        })

        return Response.json(
          { error: "Timeout ao processar webhook" },
          { status: 504 }
        )
      }

      // Criar notificação de erro genérico
      await prisma.notification.create({
        data: {
          title: "Erro na Geração do Site",
          message: `Houve um problema técnico ao gerar o site para o projeto "${project.name}". Nossa equipe foi notificada.`,
          userId: project.userId,
          projectId,
          type: "error"
        }
      })

      return Response.json(
        { 
          error: "Erro ao conectar com o serviço de geração",
          details: webhookError instanceof Error ? webhookError.message : 'Erro desconhecido'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Erro ao processar envio para webhook:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuth(handler)