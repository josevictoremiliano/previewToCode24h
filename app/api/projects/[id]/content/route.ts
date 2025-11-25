import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

interface ProjectContent {
  siteName: string
  slogan: string
  description: string
  targetAudience: string
  mainServices: string
  contactInfo: string
  brandColors: string
  style: string
  additionalRequirements?: string
  logoUrl?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { content } = await request.json()
    const resolvedParams = await params
    const projectId = resolvedParams.id

    if (!content) {
      return NextResponse.json(
        { error: "Conteúdo é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar projeto existente
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    // Preparar dados atualizados
    const currentData = (existingProject.data as any) || {}

    const updatedData = {
      ...currentData,
      basicInfo: {
        ...(currentData.basicInfo || {}),
        siteName: content.siteName,
        slogan: content.slogan
      },
      content: {
        ...(currentData.content || {}),
        description: content.description,
        targetAudience: content.targetAudience,
        mainServices: content.mainServices,
        contactInfo: content.contactInfo,
        additionalRequirements: content.additionalRequirements
      },
      visualIdentity: {
        ...(currentData.visualIdentity || {}),
        brandColors: content.brandColors,
        style: content.style,
        logoUrl: content.logoUrl
      }
    }

    // Atualizar ou criar briefing
    await prisma.briefing.upsert({
      where: { projectId },
      create: {
        projectId,
        siteName: content.siteName,
        businessType: content.style || 'Geral',
        description: content.description,
        targetAudience: content.targetAudience,
        mainServices: content.mainServices,
        contactInfo: content.contactInfo,
        brandColors: content.brandColors,
        style: content.style,
        additionalRequirements: content.additionalRequirements
      },
      update: {
        siteName: content.siteName,
        businessType: content.style || 'Geral',
        description: content.description,
        targetAudience: content.targetAudience,
        mainServices: content.mainServices,
        contactInfo: content.contactInfo,
        brandColors: content.brandColors,
        style: content.style,
        additionalRequirements: content.additionalRequirements
      }
    })

    // Atualizar dados do projeto
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        data: updatedData,
        updatedAt: new Date()
      }
    })

    // Log da alteração
    await prisma.projectLog.create({
      data: {
        projectId,
        userId: session.user.id,
        action: 'CONTENT_UPDATED',
        description: 'Conteúdo do projeto atualizado via interface de edição',
        metadata: {
          updatedFields: Object.keys(content),
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      message: "Conteúdo atualizado com sucesso",
      project: updatedProject
    })

  } catch (error) {
    console.error("❌ Erro ao atualizar conteúdo:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : 'N/A')

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}