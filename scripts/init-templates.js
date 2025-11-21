const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const HTML_TEMPLATE = {
  name: "Criação de HTML",
  key: "html_creation",
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
  variables: ["siteName", "businessType", "description", "targetAudience", "mainServices", "contactInfo", "brandColors", "style", "additionalRequirements", "slogan", "siteType", "niche", "products", "cta", "sections", "primaryColor", "secondaryColor", "customTexts", "features", "email", "phone", "address", "socialMedia"],
  isActive: true
}

async function initTemplate() {
  try {
    console.log('🔍 Verificando se template html_creation existe...')
    
    const existing = await prisma.promptTemplate.findUnique({
      where: { key: 'html_creation' }
    })

    if (existing) {
      console.log('✅ Template html_creation já existe')
      return
    }

    console.log('🏗️ Criando template html_creation...')
    
    // Buscar primeiro usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.error('❌ Nenhum usuário admin encontrado')
      return
    }

    const template = await prisma.promptTemplate.create({
      data: {
        ...HTML_TEMPLATE,
        createdById: adminUser.id
      }
    })

    console.log('✅ Template html_creation criado com sucesso:', template.id)

  } catch (error) {
    console.error('❌ Erro ao inicializar template:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initTemplate()