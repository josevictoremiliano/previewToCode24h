import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processProjectImages } from '@/lib/storage'
import { generateHtmlForProject } from '@/lib/ai/generator'
import { notifyUser } from '@/lib/notifications'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se é um admin (para aprovação inicial) ou usuário (para aprovação final)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const { action = 'admin_approve' } = body // 'admin_approve' ou 'client_approve'

    // Buscar o projeto com dados do usuário
    const project = await prisma.project.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    // Fluxo de aprovação do admin (PENDING -> PROCESSING -> PREVIEW)
    if (action === 'admin_approve') {
      // TODO: Verificar se usuário é admin
      // if (session.user.role !== 'ADMIN') {
      //   return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
      // }

      if (project.status !== 'PENDING') {
        return NextResponse.json(
          { error: `Projeto já foi processado. Status atual: ${project.status}` },
          { status: 400 }
        )
      }

      console.log('🚀 Admin aprovando projeto:', project.name)

      // 1. Atualizar status para PROCESSING
      await prisma.project.update({
        where: { id },
        data: {
          status: 'PROCESSING',
          updatedAt: new Date()
        }
      })

      console.log('📝 Status atualizado para PROCESSING')

      // 2. Processar imagens (upload para MinIO)
      let updatedProjectData = project.data

      try {
        console.log('🖼️ Processando imagens...')
        updatedProjectData = await processProjectImages(project.data, project)

        await prisma.project.update({
          where: { id },
          data: { data: updatedProjectData }
        })

        console.log('✅ Imagens processadas e salvas')
      } catch (imageError) {
        console.warn('⚠️ Erro ao processar imagens:', imageError.message)
      }

      // 3. Gerar HTML com a IA
      try {
        console.log('🤖 Gerando HTML com IA...')

        const htmlContent = await generateHtmlForProject({
          ...project,
          data: updatedProjectData
        })

        // Atualizar projeto com HTML gerado e status PREVIEW
        const finalProject = await prisma.project.update({
          where: { id },
          data: {
            data: {
              ...updatedProjectData,
              generatedContent: {
                html: htmlContent,
                generatedAt: new Date().toISOString()
              }
            },
            status: 'PREVIEW',
            updatedAt: new Date()
          }
        })

        console.log('✅ HTML gerado e projeto atualizado para PREVIEW')

        // 4. Notificar o usuário
        try {
          await notifyUser(project.userId, {
            type: 'preview_ready',
            title: '🎉 Seu site está pronto!',
            message: `O preview do seu site "${project.name}" está disponível para visualização.`,
            projectId: id
          })
          console.log('📧 Usuário notificado')
        } catch (notifyError) {
          console.warn('⚠️ Erro ao notificar usuário:', notifyError.message)
        }

        return NextResponse.json({
          message: 'Projeto aprovado e HTML gerado com sucesso',
          project: {
            id: finalProject.id,
            name: finalProject.name,
            status: finalProject.status,
            previewUrl: `/preview-page/${finalProject.id}`
          }
        })

      } catch (aiError) {
        console.error('❌ Erro na geração de HTML:', aiError)

        // Reverter status para PENDING em caso de erro
        await prisma.project.update({
          where: { id },
          data: {
            status: 'PENDING',
            updatedAt: new Date()
          }
        })

        return NextResponse.json(
          { error: `Falha na geração de HTML: ${aiError.message}` },
          { status: 500 }
        )
      }
    }

    // Fluxo de aprovação do cliente (PREVIEW -> APPROVED)
    else if (action === 'client_approve') {
      // Verificar se o projeto pertence ao usuário
      if (project.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Projeto não encontrado' },
          { status: 404 }
        )
      }

      if (project.status !== 'PREVIEW') {
        return NextResponse.json(
          { error: `Projeto não está disponível para aprovação. Status atual: ${project.status}` },
          { status: 400 }
        )
      }

      // Atualizar status para APPROVED
      const updatedProject = await prisma.project.update({
        where: { id },
        data: { status: 'APPROVED' }
      })

      // Criar notificação
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          projectId: project.id,
          type: 'PROJECT_APPROVED',
          title: 'Site aprovado!',
          message: `Você aprovou o site "${project.name}". Ele será finalizado em breve.`,
          read: false
        }
      })

      return NextResponse.json({
        message: 'Site aprovado com sucesso!',
        project: {
          id: updatedProject.id,
          status: updatedProject.status
        }
      })
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Erro no processo de aprovação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}