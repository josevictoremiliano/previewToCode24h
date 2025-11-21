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
    console.log('🤖 API: Gerando copy para projeto...')

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = resolvedParams.id

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

    // Buscar configuração de IA ativa
    const aiConfig = await prisma.aiConfig.findFirst({
      where: { isActive: true }
    })

    if (!aiConfig) {
      return NextResponse.json({ error: 'Nenhuma configuração de IA ativa encontrada' }, { status: 500 })
    }

    // Buscar template de prompt para copy
    const promptTemplate = await prisma.promptTemplate.findFirst({
      where: { key: 'copy_creation', isActive: true }
    })

    if (!promptTemplate) {
      return NextResponse.json({ error: 'Template de prompt não encontrado' }, { status: 500 })
    }

    console.log('📝 Gerando copy com IA...')

    // Type assertion para project.data
    const projectData = project.data as ProjectData

    // Preparar variáveis para o prompt
    const variables = {
      siteName: project.briefing?.siteName || projectData?.basicInfo?.siteName || '',
      slogan: projectData?.basicInfo?.slogan || '',
      siteType: project.briefing?.businessType || projectData?.basicInfo?.siteType || '',
      niche: projectData?.basicInfo?.niche || 'geral',
      targetAudience: project.briefing?.targetAudience || projectData?.content?.targetAudience || 'público geral',
      description: project.briefing?.description || projectData?.content?.description || '',
      products: project.briefing?.mainServices || (Array.isArray(projectData?.content?.products) ? projectData.content.products.join(', ') : ''),
      cta: projectData?.content?.cta || 'Entre em contato',
      sections: Array.isArray(projectData?.content?.sections)
        ? projectData.content.sections.map((s: any) => typeof s === 'string' ? s : s.name || s.title || JSON.stringify(s)).join(', ')
        : 'hero,sobre,contato',
      style: project.briefing?.style || projectData?.visualIdentity?.style || 'moderno',
      primaryColor: project.briefing?.brandColors || projectData?.visualIdentity?.primaryColor || '#3B82F6',
      secondaryColor: projectData?.visualIdentity?.secondaryColor || '#1E40AF',
      customTexts: project.briefing?.additionalRequirements || projectData?.additionalResources?.customTexts || '',
      features: Array.isArray(projectData?.additionalResources?.features) ? projectData.additionalResources.features.join(', ') : '',
      email: project.briefing?.contactInfo || projectData?.contact?.email || '',
      phone: projectData?.contact?.phone || '',
      address: projectData?.contact?.address || '',
      socialMedia: projectData?.contact?.socialMedia ? JSON.stringify(projectData.contact.socialMedia) : ''
    }

    console.log('📝 Variáveis para o prompt:', JSON.stringify(variables, null, 2))

    // Substituir variáveis no prompt
    let prompt = promptTemplate.prompt
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{ ${key} }}`
      prompt = prompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value))
    }

    // Decriptar chave (simples base64 por enquanto, conforme visto no ai-processor.ts)
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

    const generatedCopy = completion.choices[0]?.message?.content || ''

    // Atualizar projeto com a copy gerada
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        copy: generatedCopy.trim(),
        status: 'COPY_READY',
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
        action: 'COPY_GENERATED',
        description: `Copy gerada com IA (${aiConfig.model}) por ${session.user.email}`,
        metadata: {
          timestamp: new Date().toLocaleString('pt-BR'),
          method: 'AI_GENERATION',
          model: aiConfig.model,
          admin: session.user.email
        }
      }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        type: 'COPY_GENERATED',
        title: 'Copy Gerada',
        message: `Copy foi gerada automaticamente para o projeto "${project.name}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ Copy gerada com sucesso')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao gerar copy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}