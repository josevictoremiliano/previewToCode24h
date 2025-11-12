import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = resolvedParams.id
    const { images } = await request.json()

    // Verificar se o projeto existe e pertence ao usuário
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId, 
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    // Atualizar as imagens no campo data do projeto
    const currentData = project.data as any || {}
    const updatedData = {
      ...currentData,
      additionalResources: {
        ...currentData.additionalResources,
        images: images
      }
    }

    // Salvar no banco de dados
    await prisma.project.update({
      where: { id: projectId },
      data: {
        data: updatedData,
        updatedAt: new Date()
      }
    })

    // Criar log da ação
    await prisma.projectLog.create({
      data: {
        projectId,
        userId: session.user.id,
        action: 'IMAGES_UPDATED',
        description: `Usuário atualizou ${images.length} imagem(ns) do projeto`,
        metadata: {
          imagesCount: images.length,
          positions: images.reduce((acc: Record<string, number>, img: any) => {
            acc[img.position] = (acc[img.position] || 0) + 1
            return acc
          }, {})
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Imagens atualizadas com sucesso' 
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar imagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}