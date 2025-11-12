import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Extrair dados do projeto
    const projectData = project.data as any

    // Retornar dados formatados para o preview
    const response = {
      id: project.id,
      name: project.name,
      siteName: projectData?.basicInfo?.siteName || project.name,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      user: project.user,
      
      // Dados para o preview - incluir htmlContent da raiz
      htmlContent: project.htmlContent,
      generatedContent: projectData?.generatedContent || null,
      data: projectData
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao buscar projeto para preview:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}