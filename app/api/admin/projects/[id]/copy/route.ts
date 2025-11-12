import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📝 API: Salvando copy editada...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = resolvedParams.id
    const { copy } = await request.json()

    if (!copy || copy.trim().length === 0) {
      return NextResponse.json({ error: 'Copy não pode estar vazia' }, { status: 400 })
    }

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    // TODO: Verificar se é admin ou se o projeto pertence ao usuário

    // Atualizar copy
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        copy: copy.trim(),
        status: 'COPY_READY',
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
        action: 'COPY_EDITED',
        description: `Copy editada manualmente por ${session.user.email}`,
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
        type: 'COPY_UPDATED',
        title: 'Copy Atualizada',
        message: `Copy foi editada manualmente para o projeto "${project.name}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ Copy salva com sucesso')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao salvar copy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}