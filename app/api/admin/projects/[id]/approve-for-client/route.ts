import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    if (!project.htmlContent) {
      return NextResponse.json({ error: 'HTML deve ser gerado primeiro' }, { status: 400 })
    }

    // Atualizar status para aguardar aprovação do cliente
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'PREVIEW',
        updatedAt: new Date()
      },
      include: {
        user: true,
        briefing: true,
        assignedAdmin: true
      }
    })

    // Notificar cliente
    await prisma.notification.create({
      data: {
        type: 'CLIENT_APPROVAL_PENDING',
        title: 'Projeto Pronto para Aprovação',
        message: `Seu projeto "${project.name}" está pronto para aprovação! Acesse o preview e aprove ou solicite alterações.`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    // Notificar admin
    await prisma.notification.create({
      data: {
        type: 'CLIENT_APPROVAL_SENT',
        title: 'Projeto Enviado para Cliente',
        message: `Projeto "${project.name}" foi enviado para aprovação do cliente ${project.user.email}`,
        userId: session.user.id,
        projectId: project.id,
        read: false
      }
    })

    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao enviar para cliente:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}