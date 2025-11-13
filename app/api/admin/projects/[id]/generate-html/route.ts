import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🏗️ API: Gerando HTML para projeto...')
    
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

    if (!project.copy) {
      return NextResponse.json({ error: 'Copy deve ser gerada primeiro' }, { status: 400 })
    }

    console.log('🤖 Gerando HTML com IA baseado na copy e dados do projeto...')
    
    // Buscar configuração ativa da IA
    const aiConfig = await prisma.aiConfig.findFirst({
      where: { isActive: true }
    })

    if (!aiConfig) {
      console.error('❌ Nenhuma configuração de IA ativa encontrada')
      return NextResponse.json(
        { error: 'Nenhuma configuração de IA ativa encontrada. Configure a IA nas configurações do sistema.' },
        { status: 500 }
      )
    }

    // Buscar template de prompt para geração de HTML
    const promptTemplate = await prisma.promptTemplate.findFirst({
      where: { 
        key: 'html_creation',
        isActive: true 
      }
    })

    if (!promptTemplate) {
      console.error('❌ Template de prompt para HTML não encontrado')
      return NextResponse.json(
        { error: 'Template de prompt para HTML não encontrado. Configure o template nas configurações do sistema.' },
        { status: 500 }
      )
    }

    // Preparar variáveis para o template
    const templateVariables = {
      siteName: project.briefing?.siteName || project.name,
      businessType: project.briefing?.businessType || 'Empresa',
      description: project.briefing?.description || '',
      targetAudience: project.briefing?.targetAudience || '',
      mainServices: project.briefing?.mainServices || '',
      contactInfo: project.briefing?.contactInfo || '',
      brandColors: project.briefing?.brandColors || '#3B82F6, #1E40AF',
      style: project.briefing?.style || 'moderno',
      additionalRequirements: project.briefing?.additionalRequirements || '',
      slogan: '',
      siteType: project.briefing?.businessType || '',
      niche: '',
      products: project.briefing?.mainServices || '',
      cta: 'Entre em contato',
      sections: 'hero,sobre,servicos,contato',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      customTexts: '',
      features: '',
      email: project.briefing?.contactInfo || '',
      phone: '',
      address: '',
      socialMedia: ''
    }

    // Substituir variáveis no prompt
    let prompt = promptTemplate.prompt
    Object.entries(templateVariables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
      prompt = prompt.replace(placeholder, String(value || ''))
    })

    // Chamar IA para gerar HTML
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Buffer.from(aiConfig.apiKey, 'base64').toString('utf8')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          {
            role: 'system',
            content: 'Você é um desenvolvedor web especialista que cria sites HTML completos, responsivos e modernos. Sempre use as cores fornecidas, ícones do Phosphor Icons e tamanhos fixos para imagens.'
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
      const errorText = await response.text()
      console.error('❌ Erro na API da IA:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro na API da IA: ${response.status}. Verifique a configuração da API key e tente novamente.` },
        { status: 500 }
      )
    }

    const aiResponse = await response.json()
    const generatedHtml = aiResponse.choices[0]?.message?.content || ''

    if (!generatedHtml.trim()) {
      console.error('❌ IA não retornou conteúdo HTML válido')
      return NextResponse.json(
        { error: 'IA não retornou conteúdo HTML válido. Tente novamente.' },
        { status: 500 }
      )
    }

    // Log do uso da IA
    await prisma.aiUsageLog.create({
      data: {
        configId: aiConfig.id,
        promptId: promptTemplate.id,
        projectId: project.id,
        userId: session.user.id,
        inputTokens: aiResponse.usage?.prompt_tokens || 0,
        outputTokens: aiResponse.usage?.completion_tokens || 0,
        totalTokens: aiResponse.usage?.total_tokens || 0,
        cost: 0,
        success: true
      }
    })

    // Gerar URL de preview
    const previewUrl = `${process.env.NEXTAUTH_URL}/api/preview/${projectId}`

    // Atualizar projeto com HTML gerado
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        htmlContent: generatedHtml,
        previewUrl: previewUrl,
        status: 'HTML_READY',
        updatedAt: new Date()
      },
      include: {
        user: true,
        briefing: true,
        assignedAdmin: true
      }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        type: 'HTML_GENERATED',
        title: 'HTML Gerado',
        message: `HTML foi gerado automaticamente pela IA para o projeto "${project.name}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ HTML gerado com sucesso pela IA')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao gerar HTML:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}