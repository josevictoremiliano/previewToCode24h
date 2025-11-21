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
      throw new Error('Nenhuma configuração de IA ativa encontrada')
    }

    // Buscar template de prompt para geração de HTML
    let promptTemplate = await prisma.promptTemplate.findFirst({
      where: { 
        key: 'html_creation',
        isActive: true 
      }
    })

    if (!promptTemplate) {
      // Fallback para html_generation
      promptTemplate = await prisma.promptTemplate.findFirst({
        where: { 
          key: 'html_generation',
          isActive: true 
        }
      })
      
      if (!promptTemplate) {
        throw new Error('Template de prompt para HTML não encontrado')
      }
      
      console.log('📝 Usando template html_generation como fallback')
    }

    // Extrair dados do projeto
    const projectData = (typeof project.data === 'string' ? JSON.parse(project.data) : project.data) || {}
    const briefingData = project.briefing || {}

    // Processar imagens do projeto
    const projectImages = projectData?.images || {}
    const logoUrl = projectImages?.logo || projectData?.visualIdentity?.logoUrl || ''
    const heroImageUrl = projectImages?.hero || projectImages?.banner || ''
    
    // URLs de imagens profissionais como fallback
    const defaultImages = {
      hero: heroImageUrl || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop&crop=center',
      about: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center',
      services: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
      team: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop&crop=center',
      contact: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=600&fit=crop&crop=center'
    }

    // Preparar variáveis para o template do banco de dados
    const templateVariables = {
      // === DADOS BÁSICOS DO BRIEFING ===
      siteName: briefingData.siteName || project.name,
      businessType: briefingData.businessType || 'Empresa',
      description: briefingData.description || '',
      targetAudience: briefingData.targetAudience || '',
      mainServices: briefingData.mainServices || '',
      contactInfo: briefingData.contactInfo || '',
      style: briefingData.style || 'moderno',
      additionalRequirements: briefingData.additionalRequirements || '',
      
      // === DADOS COMPLEMENTARES DO PROJETO ===
      slogan: projectData?.basicInfo?.slogan || briefingData.siteName || '',
      siteType: briefingData.businessType || projectData?.basicInfo?.siteType || '',
      niche: projectData?.basicInfo?.niche || briefingData.businessType || '',
      products: briefingData.mainServices || projectData?.content?.products || '',
      cta: projectData?.content?.cta || 'Entre em contato',
      sections: projectData?.content?.sections ? (Array.isArray(projectData.content.sections) ? projectData.content.sections.join(', ') : projectData.content.sections) : 'hero,sobre,servicos,contato',
      customTexts: projectData?.additionalResources?.customTexts || '',
      features: projectData?.additionalResources?.features ? (Array.isArray(projectData.additionalResources.features) ? projectData.additionalResources.features.join(', ') : projectData.additionalResources.features) : '',
      
      // === CORES (BRIEFING TEM PRIORIDADE) ===
      primaryColor: briefingData.brandColors?.[0] || projectData?.visualIdentity?.primaryColor || '#3B82F6',
      secondaryColor: briefingData.brandColors?.[1] || projectData?.visualIdentity?.secondaryColor || '#1E40AF',
      brandColors: briefingData.brandColors ? briefingData.brandColors.join(', ') : `${projectData?.visualIdentity?.primaryColor || '#3B82F6'}, ${projectData?.visualIdentity?.secondaryColor || '#1E40AF'}`,
      
      // === CONTATO (BRIEFING TEM PRIORIDADE) ===
      email: briefingData.contactInfo || projectData?.contact?.email || '',
      phone: projectData?.contact?.phone || '',
      whatsapp: projectData?.contact?.whatsapp || '',
      address: projectData?.contact?.address || '',
      
      // === REDES SOCIAIS ===
      instagram: projectData?.contact?.instagram || '',
      facebook: projectData?.contact?.facebook || '',
      linkedin: projectData?.contact?.linkedin || '',
      twitter: projectData?.contact?.twitter || '',
      socialMedia: projectData?.contact?.socialMedia ? JSON.stringify(projectData.contact.socialMedia) : '',
      
      // === COPY GERADA (MAIS IMPORTANTE) ===
      generatedContent: project.copy || '',
      
      // === IMAGENS PROCESSADAS ===
      logoUrl: logoUrl,
      heroImage: defaultImages.hero,
      aboutImage: defaultImages.about,
      servicesImage: defaultImages.services,
      teamImage: defaultImages.team,
      contactImage: defaultImages.contact
    }

    // Substituir variáveis no prompt
    let prompt = promptTemplate.prompt
    Object.entries(templateVariables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
      prompt = prompt.replace(placeholder, String(value || ''))
    })

    console.log('📝 Dados preparados:', {
      templateKey: promptTemplate.key,
      siteName: templateVariables.siteName,
      hasGeneratedContent: !!templateVariables.generatedContent,
      hasBriefing: !!briefingData.siteName,
      primaryColor: templateVariables.primaryColor,
      secondaryColor: templateVariables.secondaryColor,
      hasImages: !!logoUrl,
      contentPreview: templateVariables.generatedContent.substring(0, 100) + '...'
    })

    // Chamar IA para gerar HTML - USANDO DEEPSEEK
    console.log('🚀 Usando DeepSeek API para geração de HTML...')
    
    // Validar se é DeepSeek
    if (aiConfig.provider !== 'deepseek') {
      throw new Error('Esta rota foi configurada para usar apenas DeepSeek. Configure DeepSeek em Admin > Configurações de IA.')
    }

    // Decodificar a chave da API
    let apiKey: string
    try {
      // Tentar decodificar do base64
      apiKey = Buffer.from(aiConfig.apiKey, 'base64').toString('utf8')
    } catch (e) {
      // Se não estiver em base64, usar como está
      apiKey = aiConfig.apiKey
    }

    // Validar se a chave parece válida (deve começar com 'sk-' para DeepSeek)
    if (!apiKey || !apiKey.startsWith('sk-')) {
      console.error('❌ Chave de DeepSeek inválida:', {
        hasKey: !!apiKey,
        startsWithSk: apiKey?.startsWith('sk-'),
        preview: apiKey?.substring(0, 10) + '...'
      })
      throw new Error('Chave de API DeepSeek inválida. Deve começar com "sk-". Verifique em https://platform.deepseek.com/api_keys')
    }

    console.log('🔑 Configuração DeepSeek:', {
      provider: aiConfig.provider,
      model: aiConfig.model,
      keyPrefix: apiKey.substring(0, 10) + '...',
      endpoint: 'https://api.deepseek.com/chat/completions'
    })

    // Usar fetch direto para DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
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
            content: 'Você é um desenvolvedor web especialista que cria sites HTML completos, responsivos e modernos. Use EXATAMENTE os dados fornecidos (briefing + copy gerada) sem inventar conteúdo. Aplique as cores corretas e posicione as imagens adequadamente.'
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

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({}))
      console.error('❌ Erro da API DeepSeek:', {
        status: deepseekResponse.status,
        statusText: deepseekResponse.statusText,
        error: errorData
      })
      throw new Error(`Erro DeepSeek API (${deepseekResponse.status}): ${errorData.error?.message || deepseekResponse.statusText}`)
    }

    const deepseekData = await deepseekResponse.json()
    const generatedHtml = deepseekData.choices?.[0]?.message?.content || ''

    if (!generatedHtml.trim()) {
      throw new Error('IA não retornou conteúdo HTML válido')
    }

    console.log('🔍 HTML gerado:', {
      length: generatedHtml.length,
      hasDoctype: generatedHtml.includes('<!DOCTYPE'),
      hasHtml: generatedHtml.includes('<html'),
      hasColors: generatedHtml.includes(templateVariables.primaryColor),
      hasImages: generatedHtml.includes('images.unsplash'),
      preview: generatedHtml.substring(0, 150) + '...'
    })

    // Log do uso da IA
    await prisma.aiUsageLog.create({
      data: {
        configId: aiConfig.id,
        promptId: promptTemplate.id,
        projectId: project.id,
        userId: session.user.id,
        inputTokens: deepseekData.usage?.prompt_tokens || 0,
        outputTokens: deepseekData.usage?.completion_tokens || 0,
        totalTokens: deepseekData.usage?.total_tokens || 0,
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
        message: `HTML foi gerado com sucesso usando briefing + copy + template do banco para o projeto "${project.name}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ HTML gerado com sucesso usando template do banco de dados')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao gerar HTML:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}