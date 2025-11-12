import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DEFAULT_PROMPTS = {
  "copy_creation": {
    name: "Criação de copy",
    category: "copywriting",
    description: "Gera conteúdo completo para landing pages baseado nas seções escolhidas pelo cliente",
    prompt: `Você é um copywriter especialista em criar conteúdo para landing pages.

**IMPORTANTE**: Crie conteúdo APENAS para as seções que o cliente solicitou. Não adicione seções extras.

**Dados do Cliente:**
- Nome do Site: {{ siteName }}
- Slogan: {{ slogan }}
- Tipo de Site: {{ siteType }}
- Nicho: {{ niche }}
- Público-Alvo: {{ targetAudience }}
- Descrição: {{ description }}
- Produtos/Serviços: {{ products }}
- CTA Principal: {{ cta }}
- Seções Solicitadas: {{ sections }}
- Estilo: {{ style }}
- Cor Primária: {{ primaryColor }}
- Cor Secundária: {{ secondaryColor }}
- Textos Personalizados: {{ customTexts }}
- Funcionalidades: {{ features }}

**SEÇÕES DISPONÍVEIS E SEUS CONTEÚDOS:**
- hero: Título principal, subtítulo, CTA principal, imagem de destaque
- sobre/about: Apresentação da empresa, missão, valores
- beneficios: Principais benefícios e vantagens
- servicos: Lista de serviços/produtos oferecidos
- depoimentos: Testimoniais de clientes (se solicitado)
- como-funciona: Passo a passo do processo
- precos: Tabela de preços (se solicitado)
- contato: Informações de contato e formulário
- galeria: Portfólio ou galeria de trabalhos
- faq: Perguntas frequentes
- credibilidade: Certificações, prêmios, números

**INSTRUÇÃO**: Gere um JSON estruturado contendo APENAS as seções listadas em "{{ sections }}". 

Para cada seção solicitada, inclua:
- titulo: Título da seção
- conteudo: Texto principal
- cta_texto: Texto do botão (se aplicável)
- elementos: Array com elementos específicos da seção

Retorne apenas o JSON, sem explicações adicionais.`,
    variables: ["siteName", "slogan", "siteType", "niche", "targetAudience", "description", "products", "cta", "sections", "style", "primaryColor", "secondaryColor", "customTexts", "features"]
  },
  "html_creation": {
    name: "Criação de HTML",
    category: "development", 
    description: "Gera código HTML completo para landing pages",
    prompt: `Crie um site HTML completo e responsivo baseado nas seguintes informações:

**Nome do Site:** {{siteName}}
**Tipo de Negócio:** {{businessType}}
**Descrição:** {{description}}
**Público-Alvo:** {{targetAudience}}
**Principais Serviços:** {{mainServices}}
**Informações de Contato:** {{contactInfo}}
**Cores da Marca:** {{brandColors}}
**Estilo Desejado:** {{style}}
**Requisitos Adicionais:** {{additionalRequirements}}

**Dados do Cliente:**
- Nome do Site: {{siteName}}
- Slogan: {{slogan}}
- Tipo: {{siteType}}
- Nicho: {{niche}}
- Público-alvo: {{targetAudience}}
- Descrição: {{description}}
- Produtos/Serviços: {{products}}
- CTA Principal: {{cta}}
- Seções solicitadas: {{sections}}
- Estilo visual: {{style}}
- Cor primária: {{primaryColor}}
- Cor secundária: {{secondaryColor}}
- Textos personalizados: {{customTexts}}
- Features especiais: {{features}}

**INFORMAÇÕES DE CONTATO:**
- Email: {{email}}
- Telefone: {{phone}}
- Endereço: {{address}}
- Redes Sociais: {{socialMedia}}

INSTRUÇÕES:
1. Crie um HTML completo com DOCTYPE, head e body
2. Inclua CSS interno responsivo e moderno
3. Use as cores da marca fornecidas (primaryColor e secondaryColor)
4. Inclua seções: header, hero, sobre, serviços, contato, footer
5. Torne o design responsivo para mobile, tablet e desktop
6. Use JavaScript vanilla se necessário para interações básicas
7. Inclua meta tags para SEO
8. Use fontes web (Google Fonts)
9. Otimize para performance e acessibilidade
10. O resultado deve ser um arquivo HTML único e completo
11. As imagens devem ser otimizadas e ter tamanho fixo para não transbordar
12. Use ícones do Phosphor Icons: <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css" /> <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css"/>
13. Garanta que as cores primária e secundária sejam aplicadas consistentemente
14. Imagens devem ter width e height fixos no CSS
15. Use a paleta de cores fornecida em gradientes e elementos visuais

Retorne APENAS o código HTML completo, sem explicações adicionais.`,
    variables: ["siteName", "businessType", "description", "targetAudience", "mainServices", "contactInfo", "brandColors", "style", "additionalRequirements", "slogan", "siteType", "niche", "products", "cta", "sections", "primaryColor", "secondaryColor", "customTexts", "features", "email", "phone", "address", "socialMedia"]
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