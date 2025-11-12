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
    const { feedback } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    // Gerar HTML revisado baseado no feedback (mock melhorado - substituir por IA real)
    let revisedHtml = project.htmlContent || ''
    
    // Aplicar melhorias baseadas no feedback comum
    if (feedback.toLowerCase().includes('cores') || feedback.toLowerCase().includes('cor')) {
      // Ajustar cores se solicitado
      revisedHtml = revisedHtml.replace(/#3498db/g, '#2980b9') // Azul mais escuro
      revisedHtml = revisedHtml.replace(/#e74c3c/g, '#c0392b') // Vermelho mais escuro
    }
    
    if (feedback.toLowerCase().includes('responsivo') || feedback.toLowerCase().includes('mobile')) {
      // Melhorar responsividade
      revisedHtml = revisedHtml.replace(
        /<head>/,
        '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      )
    }
    
    if (feedback.toLowerCase().includes('fonte') || feedback.toLowerCase().includes('texto')) {
      // Ajustar tipografia
      revisedHtml = revisedHtml.replace(/font-size:\s*14px/g, 'font-size: 16px')
      revisedHtml = revisedHtml.replace(/font-size:\s*12px/g, 'font-size: 14px')
    }
    
    // Se não houve mudanças específicas, fazer melhorias gerais
    if (revisedHtml === project.htmlContent) {
      // Adicionar meta tags se não existirem
      if (!revisedHtml.includes('meta name="description"')) {
        revisedHtml = revisedHtml.replace(
          /<head>/,
          '<head>\n<meta name="description" content="Site criado com IA - Qualidade e inovação">'
        )
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        htmlContent: revisedHtml,
        htmlFeedback: feedback,
        status: 'HTML_REVISION',
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
        action: 'HTML_REVISION_REQUESTED',
        description: `Revisão do HTML solicitada por ${session.user.email}. Feedback: "${feedback}"`,
        metadata: {
          timestamp: new Date().toLocaleString('pt-BR'),
          feedback: feedback,
          method: 'AI_REVISION',
          admin: session.user.email
        }
      }
    })

    await prisma.notification.create({
      data: {
        type: 'HTML_REVISION',
        title: 'HTML Revisado',
        message: `HTML revisado baseado no feedback`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao revisar HTML:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}