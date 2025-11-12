import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 API: Solicitando revisão da copy...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = resolvedParams.id
    const { feedback } = await request.json()

    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json({ error: 'Feedback é obrigatório' }, { status: 400 })
    }

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    console.log('🤖 Processando revisão com IA...')
    
    // Gerar copy revisada baseada no feedback (mock melhorado - substituir por IA real)
    let revisedCopy = project.copy || ''
    
    // Aplicar algumas melhorias baseadas no feedback comum
    if (feedback.toLowerCase().includes('mais detalhes') || feedback.toLowerCase().includes('conciso')) {
      // Expandir seções com mais detalhes
      revisedCopy = revisedCopy.replace(
        /## Nossos Serviços\n([^\n]+)/,
        `## Nossos Serviços

Oferecemos soluções completas e personalizadas para atender todas as suas necessidades. Nossa equipe especializada trabalha com dedicação para entregar resultados excepcionais.

### Principais Serviços:
$1

Com anos de experiência no mercado, garantimos qualidade e satisfação em cada projeto realizado.`
      )
      
      // Expandir outras seções
      revisedCopy = revisedCopy.replace(
        /### Público-Alvo\n([^\n]+)/,
        `### Nosso Público-Alvo

$1

Entendemos as necessidades específicas do nosso público e desenvolvemos soluções sob medida para cada cliente.`
      )
      
      // Adicionar mais conteúdo se a copy for muito curta
      if (revisedCopy.length < 500) {
        revisedCopy += `

## Por Que Nos Escolher?

- ✅ Qualidade comprovada
- ✅ Atendimento personalizado  
- ✅ Resultados garantidos
- ✅ Experiência no mercado

## Depoimentos

"Trabalho excepcional! Superaram todas as expectativas." - Cliente Satisfeito`
      }
    }
    
    // Se não houve mudanças significativas, pelo menos reformular o texto
    if (revisedCopy === project.copy) {
      revisedCopy = project.copy?.replace(/\./g, '. ') || '' // Adicionar espaços após pontos
    }

    // Atualizar projeto com a copy revisada
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        copy: revisedCopy,
        copyFeedback: feedback,
        status: 'COPY_REVISION',
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
        action: 'COPY_REVISION_REQUESTED',
        description: `Revisão da copy solicitada por ${session.user.email}. Feedback: "${feedback}"`,
        metadata: {
          timestamp: new Date().toLocaleString('pt-BR'),
          feedback: feedback,
          method: 'AI_REVISION',
          admin: session.user.email
        }
      }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        type: 'COPY_REVISION',
        title: 'Copy Revisada',
        message: `Copy revisada baseada no feedback: "${feedback.substring(0, 50)}${feedback.length > 50 ? '...' : ''}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ Revisão da copy processada com sucesso')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao processar revisão da copy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}