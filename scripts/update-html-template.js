const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateHtmlTemplate() {
  try {
    console.log('🔄 Atualizando template html_generation para incluir generatedContent...');
    
    const updatedPrompt = `Crie um site HTML completo e responsivo baseado nas seguintes informações:

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
- Descrição: {{description}}
- Público-Alvo: {{targetAudience}}
- Produtos/Serviços: {{products}}
- Call-to-Action: {{cta}}
- Seções: {{sections}}
- Cor Primária: {{primaryColor}}
- Cor Secundária: {{secondaryColor}}
- Textos Personalizados: {{customTexts}}
- Recursos: {{features}}
- Email: {{email}}
- Telefone: {{phone}}
- WhatsApp: {{whatsapp}}
- Endereço: {{address}}
- Instagram: {{instagram}}
- Facebook: {{facebook}}
- LinkedIn: {{linkedin}}
- Twitter: {{twitter}}

**CONTEÚDO GERADO (COPY COMPLETA):**
{{generatedContent}}

**INSTRUÇÕES:**
1. Use EXATAMENTE o conteúdo gerado acima - NÃO invente textos
2. Crie uma landing page moderna, responsiva e otimizada para conversão
3. Use as cores fornecidas no design ({{primaryColor}} e {{secondaryColor}})
4. Implemente formulário de contato funcional
5. Adicione botões de redes sociais (se fornecidas)
6. Use técnicas de UX/UI modernas
7. Inclua meta tags para SEO
8. Adicione validação JavaScript para formulários
9. Otimize para mobile-first
10. Use fontes web modernas (Google Fonts)
11. Implemente animações sutis com CSS
12. Inclua ícones Font Awesome ou Heroicons
13. Use imagens responsivas com lazy loading

**ESTRUTURA OBRIGATÓRIA:**
- Header com navegação
- Seção Hero principal
- Seção Sobre
- Seção Benefícios/Vantagens
- Seção Produtos/Serviços
- Formulário de Contato
- Rodapé com informações

**IMPORTANTE:** Use APENAS o conteúdo da copy gerada. NÃO invente textos adicionais.

Retorne APENAS o código HTML completo, pronto para ser salvo como arquivo .html`;

    const updatedVariables = [
      'siteName', 'businessType', 'description', 'targetAudience', 
      'mainServices', 'contactInfo', 'brandColors', 'style', 
      'additionalRequirements', 'slogan', 'siteType', 'niche', 
      'products', 'cta', 'sections', 'primaryColor', 'secondaryColor', 
      'customTexts', 'features', 'email', 'phone', 'whatsapp', 
      'address', 'instagram', 'facebook', 'linkedin', 'twitter', 
      'socialMedia', 'generatedContent'
    ];

    await prisma.promptTemplate.update({
      where: { key: 'html_generation' },
      data: {
        prompt: updatedPrompt,
        variables: updatedVariables
      }
    });

    console.log('✅ Template html_generation atualizado com sucesso!');
    console.log('📋 Novas variáveis:', updatedVariables.length);
    console.log('🔍 Inclui generatedContent:', updatedVariables.includes('generatedContent'));

  } catch (error) {
    console.error('❌ Erro ao atualizar template:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHtmlTemplate();