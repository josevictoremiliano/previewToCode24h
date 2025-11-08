import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o projeto existe e pertence ao usuário
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Site não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar status para APPROVED
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: { status: 'APPROVED' }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        type: 'PROJECT_APPROVED',
        title: 'Site aprovado!',
        message: `Você aprovou o site "${project.siteName}". Ele será finalizado em breve.`
      }
    })

    return NextResponse.json({
      message: 'Site aprovado com sucesso!',
      project: {
        id: updatedProject.id,
        status: updatedProject.status
      }
    })

  } catch (error) {
    console.error('Erro ao aprovar projeto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}