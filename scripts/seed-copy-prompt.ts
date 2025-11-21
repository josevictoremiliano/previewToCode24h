import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding copy prompt template...')

    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@previewtocode.com' }
    })

    if (!adminUser) {
        throw new Error('Admin user not found. Please run seed-admin.ts first.')
    }

    const prompt = `
# CONTEXTO
Você é um especialista em copywriting para landing pages de alta conversão.
Sua missão é criar o conteúdo textual (copy) para uma landing page baseada nas informações fornecidas.

# INFORMAÇÕES DO PROJETO
Nome do Site: {{ siteName }}
Slogan: {{ slogan }}
Tipo de Negócio: {{ siteType }}
Nicho: {{ niche }}
Público-Alvo: {{ targetAudience }}
Descrição: {{ description }}
Serviços/Produtos: {{ products }}
CTA Principal: {{ cta }}
Estilo: {{ style }}
Cores: {{ primaryColor }} (Primária), {{ secondaryColor }} (Secundária)

# INFORMAÇÕES DE CONTATO
Email: {{ email }}
Telefone: {{ phone }}
Endereço: {{ address }}
Redes Sociais: {{ socialMedia }}

# ESTRUTURA DA LANDING PAGE (JSON)
Gere um JSON com a seguinte estrutura para as seções da landing page.
Mantenha o tom de voz adequado ao público-alvo e ao estilo do projeto.

{
  "hero": {
    "headline": "Uma manchete impactante que prometa um resultado desejado",
    "subheadline": "Um subtítulo que complemente a promessa e quebre objeções",
    "cta": "Texto do botão de ação"
  },
  "problems": {
    "title": "Título da seção de problemas",
    "items": ["Problema 1", "Problema 2", "Problema 3", "Problema 4"]
  },
  "solution": {
    "title": "Título da seção de solução",
    "description": "Descrição de como o produto/serviço resolve os problemas"
  },
  "services": {
    "title": "Nossos Serviços",
    "items": [
      {
        "title": "Nome do Serviço 1",
        "description": "Breve descrição do serviço"
      },
      {
        "title": "Nome do Serviço 2",
        "description": "Breve descrição do serviço"
      }
    ]
  },
  "socialProof": {
    "title": "O que dizem nossos clientes",
    "items": [
      {
        "name": "Nome do Cliente",
        "text": "Depoimento curto e impactante"
      }
    ]
  },
  "faq": {
    "title": "Perguntas Frequentes",
    "items": [
      {
        "question": "Pergunta 1?",
        "answer": "Resposta 1"
      }
    ]
  },
  "footer": {
    "copyright": "Todos os direitos reservados",
    "links": ["Termos de Uso", "Política de Privacidade"]
  }
}

# REGRAS
1. Retorne APENAS o JSON válido, sem markdown ou explicações adicionais.
2. Seja persuasivo e focado em conversão.
3. Use gatilhos mentais como autoridade, escassez e prova social onde apropriado.
4. Adapte a linguagem para o nicho específico ({{ niche }}).
`

    await prisma.promptTemplate.upsert({
        where: { key: 'copy_creation' },
        update: {
            prompt,
            isActive: true,
            updatedAt: new Date(),
            createdById: adminUser.id,
            variables: [
                'siteName', 'slogan', 'siteType', 'niche', 'targetAudience',
                'description', 'products', 'cta', 'style', 'primaryColor',
                'secondaryColor', 'email', 'phone', 'address', 'socialMedia'
            ]
        },
        create: {
            key: 'copy_creation',
            name: 'Criação de Copy (Landing Page)',
            description: 'Template para gerar copy completa de landing pages',
            prompt,
            isActive: true,
            createdById: adminUser.id,
            variables: [
                'siteName', 'slogan', 'siteType', 'niche', 'targetAudience',
                'description', 'products', 'cta', 'style', 'primaryColor',
                'secondaryColor', 'email', 'phone', 'address', 'socialMedia'
            ]
        }
    })

    console.log('✅ Template copy_creation seeded!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
