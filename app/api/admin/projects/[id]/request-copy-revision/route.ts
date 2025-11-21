import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Interface para tipar o campo JSON project.data
interface ProjectData {
  basicInfo?: {
    siteName?: string
    slogan?: string
    siteType?: string
    niche?: string
  }
  content?: {
    targetAudience?: string
    description?: string
    products?: string[]
    cta?: string
    sections?: Array<string | { name?: string; title?: string;[key: string]: any }>
  }
  visualIdentity?: {
    style?: string
    primaryColor?: string
    secondaryColor?: string
  }
  additionalResources?: {
    customTexts?: string
    features?: string[]
  }
  contact?: {
    email?: string
    phone?: string
    address?: string
    socialMedia?: Record<string, string>
  }
}

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
      include: {
        user: true,
        briefing: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    if (!project.copy) {
      return NextResponse.json({ error: 'Nenhuma copy foi gerada ainda' }, { status: 400 })
    }

    // Buscar configuração de IA ativa
    const aiConfig = await prisma.aiConfig.findFirst({
      where: { isActive: true }
    })

    if (!aiConfig) {
      return NextResponse.json({ error: 'Nenhuma configuração de IA ativa encontrada' }, { status: 500 })
    }

    // Buscar template de prompt para revisão de copy
    const promptTemplate = await prisma.promptTemplate.findFirst({
      where: { key: 'copy_revision', isActive: true }
    })

    if (!promptTemplate) {
      return NextResponse.json({ error: 'Template de prompt para revisão não encontrado' }, { status: 500 })
    }

    console.log('🤖 Processando revisão com IA...')

    // Type assertion para project.data
    const projectData = project.data as ProjectData

    // Preparar variáveis para o prompt de revisão
    const variables = {
      siteName: project.briefing?.siteName || projectData?.basicInfo?.siteName || '',
      slogan: projectData?.basicInfo?.slogan || '',
      siteType: project.briefing?.businessType || projectData?.basicInfo?.siteType || '',
      niche: projectData?.basicInfo?.niche || 'geral',
      targetAudience: project.briefing?.targetAudience || projectData?.content?.targetAudience || 'público geral',
      description: project.briefing?.description || projectData?.content?.description || '',
      products: project.briefing?.mainServices || (Array.isArray(projectData?.content?.products) ? projectData.content.products.join(', ') : ''),
      cta: projectData?.content?.cta || 'Entre em contato',
      style: project.briefing?.style || projectData?.visualIdentity?.style || 'moderno',
      primaryColor: project.briefing?.brandColors || projectData?.visualIdentity?.primaryColor || '#3B82F6',
      secondaryColor: projectData?.visualIdentity?.secondaryColor || '#1E40AF',
      currentCopy: project.copy,
      feedback: feedback
    }

    // Substituir variáveis no prompt
    let prompt = promptTemplate.prompt
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{ ${key} }}`
      prompt = prompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value))
    }

    // Decriptar chave da API
    const apiKey = Buffer.from(aiConfig.apiKey, 'base64').toString('utf8')

    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.groq.com/openai/v1'
    })

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
    })

    const revisedCopy = completion.choices[0]?.message?.content || ''

    if (!revisedCopy.trim()) {
      return NextResponse.json({ error: 'IA não retornou revisão válida' }, { status: 500 })
    }

    // Atualizar projeto com a copy revisada
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        copy: revisedCopy.trim(),
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

    // Registrar uso da IA
    await prisma.aiUsageLog.create({
      data: {
        configId: aiConfig.id,
        promptId: promptTemplate.id,
        projectId: project.id,
        userId: session.user.id,
        inputTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        success: true
      }
    })

    // Criar log da ação
    await prisma.projectLog.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        action: 'COPY_REVISION_REQUESTED',
        description: `Revisão da copy solicitada com IA (${aiConfig.model}) por ${session.user.email}. Feedback: "${feedback}"`,
        metadata: {
          timestamp: new Date().toLocaleString('pt-BR'),
          feedback: feedback,
          method: 'AI_REVISION',
          model: aiConfig.model,
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
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}