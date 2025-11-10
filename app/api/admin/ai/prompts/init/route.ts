import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DEFAULT_PROMPTS = {
  "copy_creation": {
    name: "Criação de copy",
    category: "copywriting",
    description: "Gera conteúdo completo para landing pages",
    prompt: "Você é um copywriter especialista em criar conteúdo para landing pages.\nCom base nos dados fornecidos abaixo, crie um conteúdo completo e profissional para um site/landing page.\n\n**Dados do Cliente:**\n- Nome: {{ nomeSite }}\n- Email: {{ email }}\n- Público-Alvo: {{ publicoAlvo }}\n- Serviços/Produtos: {{ servicos }}\n- Tom de Voz: {{ tomDeVoz }}\n- Cores: {{ cores }}\n- Descrição: {{ descricao }}\n\nGere um JSON estruturado com:\n1. titulo_principal (chamativo)\n2. subtitulo (complemento)\n3. secao_sobre (texto de apresentação)\n4. servicos (array com título e descrição de cada serviço/produto)\n5. secao_cta (call to action)\n6. secao_contato (texto de convite para contato)\n\nRetorne apenas o JSON, sem explicações.",
    variables: ["nomeSite", "email", "publicoAlvo", "servicos", "tomDeVoz", "cores", "descricao"]
  },
  "html_creation": {
    name: "Criação de HTML",
    category: "development",
    description: "Gera código HTML completo para landing pages",
    prompt: "Você é um desenvolvedor web especialista em criar landing pages em HTML, CSS e JavaScript vanilla.\n\nCom base no conteúdo JSON gerado pela IA anterior, crie uma landing page COMPLETA e MODERNA:\n\n**Conteúdo (JSON):**\n{{ jsonCopy }}\n\n**Requisitos técnicos:**\n1. HTML5 semântico e bem estruturado\n2. CSS incorporado no <style> com design moderno, gradientes, responsivo (mobile-first)\n3. JavaScript vanilla incorporado no <script> com animações e interações suaves\n4. Cores principais: {{ cores }}\n5. Design flutuante/moderno\n6. Botão WhatsApp flutuante\n7. Cores modernas e agradáveis\n\nRetorne APENAS o código HTML completo, pronto para salvar em arquivo .html",
    variables: ["jsonCopy", "cores"]
  }
}

async function handlePost(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    const created = []
    const skipped = []

    for (const [key, template] of Object.entries(DEFAULT_PROMPTS)) {
      try {
        // Verificar se já existe
        const existing = await prisma.promptTemplate.findUnique({
          where: { key }
        })

        if (existing) {
          skipped.push(key)
          continue
        }

        // Criar novo template
        const newTemplate = await prisma.promptTemplate.create({
          data: {
            name: template.name,
            key,
            prompt: template.prompt,
            description: template.description,
            category: template.category,
            variables: template.variables,
            isActive: true,
            createdById: session.user.id
          }
        })

        created.push(key)
      } catch (error) {
        console.error(`Erro ao criar template ${key}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${created.length} templates criados, ${skipped.length} já existiam`,
      created,
      skipped
    })
  } catch (error) {
    console.error('Erro ao inicializar templates:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuth(handlePost)