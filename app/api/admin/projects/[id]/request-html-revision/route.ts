import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 API: Solicitando revisão do HTML...')

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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        briefing: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    if (!project.htmlContent) {
      return NextResponse.json({ error: 'Nenhum HTML foi gerado ainda' }, { status: 400 })
    }

    // Buscar configuração de IA ativa
    const aiConfig = await prisma.aiConfig.findFirst({
      where: { isActive: true }
    })

    if (!aiConfig) {
      return NextResponse.json({ error: 'Nenhuma configuração de IA ativa encontrada' }, { status: 500 })
    }

    // Buscar template de prompt para revisão de HTML
    const promptTemplate = await prisma.promptTemplate.findFirst({
      where: { key: 'html_revision', isActive: true }
    })

    if (!promptTemplate) {
      return NextResponse.json({ error: 'Template de prompt para revisão de HTML não encontrado' }, { status: 500 })
    }

    console.log('🤖 Processando revisão de HTML com IA...')

    // Preparar variáveis para o prompt de revisão
    const variables = {
      siteName: project.briefing?.siteName || project.name,
      currentHtml: project.htmlContent,
      currentCopy: project.copy || '',
      feedback: feedback,
      primaryColor: project.briefing?.brandColors || '#3B82F6',
      secondaryColor: '#1E40AF'
    }

    // Substituir variáveis no prompt
    let prompt = promptTemplate.prompt
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{ ${key} }}`
      prompt = prompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value))
    }

    // Decriptar chave da API
    const apiKey = Buffer.from(aiConfig.apiKey, 'base64').toString('utf8')

    // Usar DeepSeek API (compatível com OpenAI)
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          {
            role: 'system',
            content: 'Você é um desenvolvedor web especialista que revisa e melhora código HTML baseado em feedback específico. Mantenha a estrutura e estilo existente, apenas fazendo as mudanças solicitadas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Erro da API:', errorData)
      throw new Error(`Erro ao chamar IA: ${response.status}`)
    }

    const data = await response.json()
    const revisedHtml = data.choices?.[0]?.message?.content || ''

    if (!revisedHtml.trim()) {
      return NextResponse.json({ error: 'IA não retornou revisão válida' }, { status: 500 })
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        htmlContent: revisedHtml.trim(),
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

    // Registrar uso da IA
    await prisma.aiUsageLog.create({
      data: {
        configId: aiConfig.id,
        promptId: promptTemplate.id,
        projectId: project.id,
        userId: session.user.id,
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        success: true
      }
    })

    // Criar log da ação
    await prisma.projectLog.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        action: 'HTML_REVISION_REQUESTED',
        description: `Revisão do HTML solicitada com IA (${aiConfig.model}) por ${session.user.email}. Feedback: "${feedback}"`,
        metadata: {
          timestamp: new Date().toLocaleString('pt-BR'),
          feedback: feedback,
          method: 'AI_REVISION',
          model: aiConfig.model,
          admin: session.user.email
        }
      }
    })

    await prisma.notification.create({
      data: {
        type: 'HTML_REVISION',
        title: 'HTML Revisado',
        message: `HTML revisado baseado no feedback: "${feedback.substring(0, 50)}${feedback.length > 50 ? '...' : ''}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ Revisão de HTML processada com sucesso')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao revisar HTML:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}