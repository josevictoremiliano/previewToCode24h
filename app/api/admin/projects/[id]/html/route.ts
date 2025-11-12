import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Verificar autenticação e autorização admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { htmlContent } = await request.json()

    if (!htmlContent || htmlContent.trim().length === 0) {
      return NextResponse.json({ error: 'HTML é obrigatório' }, { status: 400 })
    }

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        briefing: true,
        assignedAdmin: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    console.log('💾 API: Salvando HTML editado manualmente...')

    // Atualizar projeto com HTML editado
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        htmlContent: htmlContent.trim(),
        status: 'HTML_READY',
        updatedAt: new Date()
      },
      include: {
        user: true,
        briefing: true,
        assignedAdmin: true
      }
    })

    // Criar log da ação
    await prisma.projectLog.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        action: 'HTML_EDITED',
        description: `HTML editado manualmente por ${session.user.email}`,
        metadata: {
          timestamp: new Date().toLocaleString('pt-BR'),
          method: 'MANUAL_EDIT',
          admin: session.user.email
        }
      }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        type: 'HTML_UPDATED',
        title: 'HTML Atualizado',
        message: `HTML foi editado manualmente para o projeto "${project.name}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ HTML salvo com sucesso')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao salvar HTML:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}