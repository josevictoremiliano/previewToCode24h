import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para gerar HTML usando IA
async function generateHTMLWithAI(projectData: any): Promise<string> {
  try {
    // Buscar configuração ativa da IA
    const aiConfig = await prisma.aiConfig.findFirst({
      where: { isActive: true }
    });

    if (!aiConfig) {
      throw new Error('Nenhuma configuração de IA ativa encontrada');
    }

    // Buscar template de prompt para geração de HTML
    const promptTemplate = await prisma.promptTemplate.findFirst({
      where: { 
        key: 'html_creation',
        isActive: true 
      }
    });

    if (!promptTemplate) {
      throw new Error('Template de prompt para HTML não encontrado');
    }

    // Preparar dados do projeto para o prompt
    const projectInfo = {
      siteName: projectData.siteName || projectData.name,
      businessType: projectData.businessType || 'Empresa',
      description: projectData.description || '',
      targetAudience: projectData.targetAudience || '',
      mainServices: projectData.mainServices || [],
      contactInfo: projectData.contactInfo || {},
      brandColors: projectData.brandColors || ['#3B82F6', '#10B981'],
      style: projectData.style || 'modern',
      additionalRequirements: projectData.additionalRequirements || ''
    };

    // Substituir variáveis no template
    let prompt = promptTemplate.prompt;
    
    // Substituir cada variável no prompt
    Object.entries(projectInfo).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const replacement = Array.isArray(value) ? value.join(', ') : 
                         typeof value === 'object' ? JSON.stringify(value) : 
                         String(value);
      prompt = prompt.replace(new RegExp(placeholder, 'g'), replacement);
    });

    // Fazer chamada para a API da IA baseada no provider
    let aiResponse: string;
    
    if (aiConfig.provider === 'groq') {
      aiResponse = await callGroqAPI(aiConfig, prompt);
    } else if (aiConfig.provider === 'openai') {
      aiResponse = await callOpenAI(aiConfig, prompt);
    } else {
      throw new Error(`Provider ${aiConfig.provider} não suportado`);
    }

    // Log do uso da IA
    await prisma.aiUsageLog.create({
      data: {
        configId: aiConfig.id,
        promptId: promptTemplate.id,
        projectId: projectData.id,
        success: true,
        userId: projectData.userId,
        // inputTokens, outputTokens, cost seriam calculados baseado na resposta da API
      }
    });

    return aiResponse;

  } catch (error) {
    console.error('Erro ao gerar HTML com IA:', error);
    
    // Log do erro
    const aiConfig = await prisma.aiConfig.findFirst({ where: { isActive: true } });
    if (aiConfig) {
      await prisma.aiUsageLog.create({
        data: {
          configId: aiConfig.id,
          projectId: projectData.id,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          userId: projectData.userId,
        }
      });
    }
    
    throw error;
  }
}

async function callGroqAPI(config: any, prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em desenvolvimento web que cria sites HTML completos e responsivos.'
        },
        {
          role: 'user', 
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na API Groq: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callOpenAI(config: any, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em desenvolvimento web que cria sites HTML completos e responsivos.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro na API OpenAI: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    
    // Buscar o projeto
    const project = await prisma.project.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    if (project.status !== 'PROCESSING') {
      return NextResponse.json({ error: 'Projeto não está em processamento' }, { status: 400 });
    }

    // Gerar HTML com IA
    const generatedHTML = await generateHTMLWithAI({
      id: project.id,
      userId: project.userId,
      name: project.name,
      ...project.data as any
    });

    // Atualizar projeto com HTML gerado e mudar status para PREVIEW
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: 'PREVIEW',
        data: {
          ...project.data as any,
          generatedContent: {
            html: generatedHTML,
            generatedAt: new Date().toISOString()
          }
        },
        updatedAt: new Date()
      }
    });

    // Criar notificação para o usuário
    await prisma.notification.create({
      data: {
        userId: project.userId,
        projectId: id,
        type: 'PREVIEW_READY',
        title: 'Preview Pronto!',
        message: `O preview do seu site "${project.name}" está pronto para visualização. Acesse seu painel para ver o resultado e aprovar.`,
        read: false
      }
    });

    // Se houver um admin assignado, notificar também
    if (project.assignedAdminId) {
      await prisma.notification.create({
        data: {
          userId: project.assignedAdminId,
          projectId: id,
          type: 'HTML_GENERATED',
          title: 'HTML Gerado com Sucesso',
          message: `O HTML do projeto "${project.name}" foi gerado pela IA e está disponível para o cliente.`,
          read: false
        }
      });
    }

    return NextResponse.json({ 
      message: 'HTML gerado com sucesso',
      project: updatedProject
    });

  } catch (error) {
    console.error('Erro ao gerar HTML:', error);
    
    // Em caso de erro, reverter status do projeto
    try {
      await prisma.project.update({
        where: { id: params.id },
        data: {
          status: 'PENDING', // Volta para pending para reprocessar
          updatedAt: new Date()
        }
      });

      // Notificar admins do erro
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            projectId: params.id,
            type: 'GENERATION_ERROR',
            title: 'Erro na Geração HTML',
            message: `Falha ao gerar HTML para o projeto. Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            read: false
          }
        });
      }
    } catch (rollbackError) {
      console.error('Erro ao reverter status:', rollbackError);
    }

    return NextResponse.json({ 
      error: 'Erro ao gerar HTML',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}