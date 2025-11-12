const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupInitialData() {
  try {
    console.log('🔧 Configurando dados iniciais...');

    // 1. Verificar se existe algum admin
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    // Se não existir admin, criar um usuário admin padrão
    if (!adminUser) {
      console.log('👤 Criando usuário admin padrão...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@previewtocode.com',
          name: 'Administrador',
          role: 'ADMIN',
          password: hashedPassword
        }
      });
      console.log('✅ Admin criado:', adminUser.email);
      console.log('📋 Credenciais: admin@previewtocode.com / admin123');
    } else {
      console.log('👤 Admin existente encontrado:', adminUser.email);
    }

    // 2. Verificar se já existe template de HTML
    const existingTemplate = await prisma.promptTemplate.findFirst({
      where: { key: 'html_generation' }
    });

    if (!existingTemplate) {
      console.log('📝 Criando template de geração HTML...');
      await prisma.promptTemplate.create({
        data: {
          name: 'Geração de HTML Completo',
          key: 'html_generation',
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

INSTRUÇÕES:
1. Crie um HTML completo com DOCTYPE, head e body
2. Inclua CSS interno responsivo e moderno
3. Use as cores da marca fornecidas
4. Inclua seções: header, hero, sobre, serviços, contato, footer
5. Torne o design responsivo para mobile, tablet e desktop
6. Use JavaScript vanilla se necessário para interações básicas
7. Inclua meta tags para SEO
8. Use fontes web (Google Fonts)
9. Otimize para performance e acessibilidade
10. O resultado deve ser um arquivo HTML único e completo

Retorne APENAS o código HTML completo, sem explicações adicionais.`,
          description: 'Template para geração automática de sites HTML completos pela IA',
          category: 'html',
          variables: ["siteName", "businessType", "description", "targetAudience", "mainServices", "contactInfo", "brandColors", "style", "additionalRequirements"],
          createdById: adminUser.id
        }
      });
      console.log('✅ Template de HTML criado');
    } else {
      console.log('📝 Template de HTML já existe');
    }

    // 3. Verificar se já existe configuração de IA
    const existingConfig = await prisma.aiConfig.findFirst({
      where: { isActive: true }
    });

    if (!existingConfig) {
      console.log('🤖 Criando configuração padrão da IA...');
      await prisma.aiConfig.create({
        data: {
          provider: 'groq',
          apiKey: 'sua_api_key_aqui', // Substitua pela sua API key real
          model: 'llama3-70b-8192',
          maxTokens: 4000,
          temperature: 0.7,
          description: 'Configuração padrão para Groq Llama3-70B',
          createdById: adminUser.id
        }
      });
      console.log('✅ Configuração da IA criada (lembre-se de atualizar a API key!)');
    } else {
      console.log('🤖 Configuração da IA já existe');
    }

    console.log('\n🎉 Setup concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Atualize a API key da IA no banco de dados');
    console.log('2. Acesse /admin/projects/pending para aprovar briefings');
    console.log('3. Teste o fluxo completo criando um projeto');

  } catch (error) {
    console.error('❌ Erro durante setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupInitialData();