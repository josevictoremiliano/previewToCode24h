import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const revisionSchema = z.object({
  message: z.string().min(1, 'Mensagem é obrigatória')
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { message } = revisionSchema.parse(body)

    // Verificar se o projeto existe e pertence ao usuário
    const project = await prisma.project.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Site não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar status para REVISION
    const updatedProject = await prisma.project.update({
      where: { id: id },
      data: { status: 'REVISION' }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        type: 'PROJECT_REVISION',
        title: 'Revisão solicitada',
        message: `Você solicitou revisão para o site "${project.siteName}": ${message}`
      }
    })

    return NextResponse.json({
      message: 'Solicitação de revisão enviada com sucesso!',
      project: {
        id: updatedProject.id,
        status: updatedProject.status
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Erro ao solicitar revisão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}