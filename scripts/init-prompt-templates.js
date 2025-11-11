const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPromptTemplates() {
  console.log('🚀 Criando templates de prompt...');
  
  try {
    // Buscar usuário admin
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.log('❌ Nenhum usuário admin encontrado. Criando usuário admin...');
      adminUser = await prisma.user.create({
        data: {
          name: 'Sistema Admin',
          email: 'admin@sistema.com',
          role: 'ADMIN'
        }
      });
    }
    
    console.log(`👤 Usando admin: ${adminUser.email}`);
    
    // 1. Template para criação de copy/conteúdo
    const copyTemplate = await prisma.promptTemplate.upsert({
      where: { key: 'copy_creation' },
      update: {},
      create: {
        name: 'Criação de Copy para Landing Page',
        key: 'copy_creation',
        prompt: `Você é um copywriter especialista em criar conteúdo para landing pages.
Com base nos dados fornecidos abaixo, crie um conteúdo completo e profissional para uma landing page.

**Dados do Projeto:**
- Nome do Site: {{ siteName }}
- Slogan: {{ slogan }}
- Tipo de Site: {{ siteType }}
- Nicho: {{ niche }}
- Proposta de Valor: {{ description }}
- Público-Alvo: {{ targetAudience }}
- Produtos/Serviços: {{ products }}
- Call-to-Action: {{ cta }}
- Estilo Visual: {{ style }}

**Instruções:**
Crie um conteúdo persuasivo e profissional que:
1. Capture a atenção do público-alvo
2. Comunique claramente a proposta de valor
3. Seja otimizado para conversão
4. Mantenha consistência com o estilo e nicho

Gere um JSON estruturado com:
- titulo_principal: Título principal chamativo
- subtitulo: Subtítulo que complementa o título
- secao_hero: Texto da seção hero/principal
- secao_sobre: Texto de apresentação da empresa/produto
- secao_beneficios: Array com 3-5 benefícios principais
- secao_produtos: Array com produtos/serviços (título e descrição)
- secao_cta: Texto do call-to-action
- secao_contato: Texto de convite para contato
- secao_footer: Texto do rodapé

Retorne APENAS o JSON, sem explicações adicionais.`,
        description: 'Template para gerar copy e conteúdo textual das landing pages',
        category: 'copy',
        isActive: true,
        variables: [
          'siteName', 'slogan', 'siteType', 'niche', 'description', 
          'targetAudience', 'products', 'cta', 'style'
        ],
        createdById: adminUser.id
      }
    });
    
    // 2. Template para geração de HTML
    const htmlTemplate = await prisma.promptTemplate.upsert({
      where: { key: 'html_generation' },
      update: {},
      create: {
        name: 'Geração de HTML para Landing Page',
        key: 'html_generation',
        prompt: `Você é um desenvolvedor front-end especialista em criar landing pages responsivas e de alta conversão.
Com base no conteúdo e dados fornecidos, crie o código HTML completo da landing page.

**Dados do Projeto:**
- Nome do Site: {{ siteName }}
- Slogan: {{ slogan }}
- Cor Primária: {{ primaryColor }}
- Cor Secundária: {{ secondaryColor }}
- Email de Contato: {{ email }}
- Telefone: {{ phone }}
- WhatsApp: {{ whatsapp }}
- Endereço: {{ address }}
- Instagram: {{ instagram }}
- Facebook: {{ facebook }}
- LinkedIn: {{ linkedin }}
- Twitter: {{ twitter }}

**Conteúdo Gerado:**
{{ generatedContent }}

**Instruções:**
1. Crie uma landing page moderna, responsiva e otimizada para conversão
2. Use as cores fornecidas no design
3. Implemente formulário de contato funcional
4. Adicione botões de redes sociais (se fornecidas)
5. Use técnicas de UX/UI modernas
6. Inclua meta tags para SEO
7. Adicione validação JavaScript para formulários
8. Otimize para mobile-first
9. Use fontes web modernas (Google Fonts)
10. Implemente animações sutis com CSS

Estrutura necessária:
- Header com navegação
- Seção Hero principal
- Seção Sobre
- Seção Benefícios/Vantagens
- Seção Produtos/Serviços
- Formulário de Contato
- Rodapé com informações

Retorne APENAS o código HTML completo, pronto para ser salvo como arquivo .html`,
        description: 'Template para gerar o código HTML completo das landing pages',
        category: 'html',
        isActive: true,
        variables: [
          'siteName', 'slogan', 'primaryColor', 'secondaryColor', 'email', 
          'phone', 'whatsapp', 'address', 'instagram', 'facebook', 
          'linkedin', 'twitter', 'generatedContent'
        ],
        createdById: adminUser.id
      }
    });
    
    console.log('✅ Templates criados com sucesso!');
    console.log(`📝 Copy Template ID: ${copyTemplate.id}`);
    console.log(`💻 HTML Template ID: ${htmlTemplate.id}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createPromptTemplates()
  .then(() => {
    console.log('🎉 Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na execução:', error);
    process.exit(1);
  });