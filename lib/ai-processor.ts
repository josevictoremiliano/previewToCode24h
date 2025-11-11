import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

interface ProjectData {
  userId: string
  projectId: string
  basicInfo: {
    siteName: string
    slogan?: string
    siteType: string
    niche?: string
  }
  visualIdentity: {
    logoUrl?: string
    primaryColor: string
    secondaryColor: string
    style?: string
    referenceUrls: string[]
  }
  content: {
    description?: string
    targetAudience?: string
    products: string[]
    cta?: string
    sections: string[]
  }
  contact: {
    email: string
    phone?: string
    address?: string
    socialMedia: {
      instagram?: string
      facebook?: string
      linkedin?: string
      twitter?: string
      whatsapp?: string
    }
  }
  additionalResources: {
    images: string[]
    customTexts?: string
    features: string[]
  }
  timestamp: string
}

// Função para descriptografar chave de API
function decryptApiKey(encryptedKey: string): string {
  try {
    // Verificar se é base64 simples (fallback)
    if (!encryptedKey.includes(':')) {
      return Buffer.from(encryptedKey, 'base64').toString('utf8')
    }
    
    // Por enquanto, apenas o fallback base64 está funcionando
    return Buffer.from(encryptedKey, 'base64').toString('utf8')
  } catch (error) {
    console.error('Erro ao descriptografar chave:', error)
    return ''
  }
}

// Função para obter configuração ativa de IA
async function getActiveAiConfig() {
  const config = await prisma.aiConfig.findFirst({
    where: { isActive: true }
  })
  
  if (!config) {
    throw new Error('Nenhuma configuração de IA ativa encontrada')
  }
  
  return config
}

// Função para obter template de prompt
async function getPromptTemplate(key: string) {
  const template = await prisma.promptTemplate.findFirst({
    where: { 
      key,
      isActive: true 
    }
  })
  
  if (!template) {
    throw new Error(`Template de prompt '${key}' não encontrado`)
  }
  
  return template
}

// Função para substituir variáveis no prompt
function replaceVariables(prompt: string, variables: Record<string, string>): string {
  let result = prompt
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{ ${key} }}`
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value)
  }
  
  return result
}

// Função para gerar conteúdo usando IA
async function generateContent(prompt: string, configId: string, projectId: string, userId: string, promptId?: string) {
  const config = await prisma.aiConfig.findUnique({
    where: { id: configId }
  })
  
  if (!config) {
    throw new Error('Configuração de IA não encontrada')
  }
  
  const decryptedApiKey = decryptApiKey(config.apiKey)
  
  const openai = new OpenAI({
    apiKey: decryptedApiKey,
    baseURL: 'https://api.groq.com/openai/v1'
  })
  
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
  })
  
  const response = completion.choices[0]?.message?.content || ''
  
  // Log de uso
  await prisma.aiUsageLog.create({
    data: {
      configId: config.id,
      promptId,
      projectId: projectId,
      userId: userId,
      inputTokens: completion.usage?.prompt_tokens || 0,
      outputTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      cost: 0, // Calcular custo se necessário
      responseTime: null, // Pode ser calculado se necessário
      success: true,
      errorMessage: null
    }
  })
  
  return response
}

// Função principal para processar projeto com IA
export async function processProjectWithAI(projectData: ProjectData, projectId: string, userId: string) {
  try {
    // Obter configuração ativa
    const aiConfig = await getActiveAiConfig()
    
    // 1. Gerar copy/conteúdo para o site
    const copyTemplate = await getPromptTemplate('copy_creation')
    
    const copyVariables = {
      siteName: projectData.basicInfo.siteName,
      siteType: projectData.basicInfo.siteType,
      niche: projectData.basicInfo.niche || 'geral',
      targetAudience: projectData.content.targetAudience || 'público geral',
      products: projectData.content.products.join(', '),
      description: projectData.content.description || '',
      cta: projectData.content.cta || 'Entre em contato',
      style: projectData.visualIdentity.style || 'moderno'
    }
    
    const copyPrompt = replaceVariables(copyTemplate.prompt, copyVariables)
    const generatedCopy = await generateContent(copyPrompt, aiConfig.id, projectId, userId, copyTemplate.id)
    
    // 2. Gerar HTML do site
    const htmlTemplate = await getPromptTemplate('html_generation')
    
    const htmlVariables = {
      siteName: projectData.basicInfo.siteName,
      slogan: projectData.basicInfo.slogan || '',
      primaryColor: projectData.visualIdentity.primaryColor,
      secondaryColor: projectData.visualIdentity.secondaryColor,
      email: projectData.contact.email,
      phone: projectData.contact.phone || '',
      address: projectData.contact.address || '',
      instagram: projectData.contact.socialMedia.instagram || '',
      facebook: projectData.contact.socialMedia.facebook || '',
      whatsapp: projectData.contact.socialMedia.whatsapp || '',
      generatedContent: generatedCopy
    }
    
    const htmlPrompt = replaceVariables(htmlTemplate.prompt, htmlVariables)
    const generatedHtml = await generateContent(htmlPrompt, aiConfig.id, projectId, userId, htmlTemplate.id)
    
    // 3. Atualizar projeto no banco com o conteúdo gerado
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'PREVIEW',
        previewUrl: `/preview/${projectId}`, // URL do preview
        data: {
          ...projectData,
          generatedContent: {
            copy: generatedCopy,
            html: generatedHtml,
            generatedAt: new Date().toISOString()
          }
        }
      }
    })
    
    // 4. Criar notificação de preview pronto
    await prisma.notification.create({
      data: {
        userId: projectData.userId,
        projectId: projectId,
        type: "PROJECT_PREVIEW",
        title: "Preview do seu site está pronto!",
        message: `O preview do site "${projectData.basicInfo.siteName}" foi gerado com sucesso. Acesse para visualizar e aprovar.`,
      }
    })
    
    return {
      success: true,
      previewUrl: `/preview/${projectId}`,
      copy: generatedCopy,
      html: generatedHtml
    }
    
  } catch (error) {
    console.error('Erro ao processar projeto com IA:', error)
    
    // Atualizar projeto com erro
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'REVISION',
        data: {
          ...projectData,
          error: {
            message: error instanceof Error ? error.message : 'Erro desconhecido',
            timestamp: new Date().toISOString()
          }
        }
      }
    })
    
    // Notificação de erro
    await prisma.notification.create({
      data: {
        userId: projectData.userId,
        projectId: projectId,
        type: "PROJECT_ERROR",
        title: "Erro ao processar seu site",
        message: `Ocorreu um erro ao gerar o preview do site "${projectData.basicInfo.siteName}". Nossa equipe foi notificada.`,
      }
    })
    
    throw error
  }
}