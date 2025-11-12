const { PrismaClient } = require('@prisma/client');

async function checkProjectDetails() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando detalhes do projeto Marinha...\n');
    
    const project = await prisma.project.findUnique({
      where: { id: 'cmhtgjwau000do80je5p7oiym' },
      include: { user: true }
    });
    
    if (!project) {
      console.log('❌ Projeto não encontrado');
      return;
    }
    
    console.log('📋 Informações básicas:');
    console.log(`  Nome: ${project.name}`);
    console.log(`  Status: ${project.status}`);
    console.log(`  Usuário: ${project.user?.name} (${project.user?.email})`);
    console.log(`  Criado: ${project.createdAt}\n`);
    
    console.log('📊 Dados do projeto (JSON):');
    console.log('  Estrutura:', JSON.stringify(Object.keys(project.data), null, 2));
    
    // Verificar se há imagens no data
    if (project.data.images) {
      console.log('\n🖼️ Imagens encontradas:');
      console.log('  Total:', project.data.images.length);
      console.log('  Estrutura da primeira imagem:', JSON.stringify(project.data.images[0], null, 2));
    } else if (project.data.briefing && project.data.briefing.images) {
      console.log('\n🖼️ Imagens no briefing:');
      console.log('  Total:', project.data.briefing.images.length);
      console.log('  Estrutura da primeira imagem:', JSON.stringify(project.data.briefing.images[0], null, 2));
    } else {
      console.log('\n📷 Verificando outros campos que podem conter imagens...');
      const dataStr = JSON.stringify(project.data);
      const imageFields = ['image', 'photo', 'picture', 'logo', 'banner', 'gallery'];
      
      imageFields.forEach(field => {
        if (dataStr.includes(field)) {
          console.log(`  ✓ Campo '${field}' encontrado no JSON`);
        }
      });
    }
    
    // Verificar HTML gerado
    if (project.data.generatedContent && project.data.generatedContent.html) {
      const html = project.data.generatedContent.html;
      console.log('\n🔧 Análise do HTML gerado:');
      console.log(`  Tamanho: ${html.length} caracteres`);
      
      // Buscar por tags de imagem
      const imgMatches = html.match(/<img[^>]+>/gi);
      if (imgMatches) {
        console.log(`  Tags <img>: ${imgMatches.length} encontradas`);
        console.log('  Primeira tag img:', imgMatches[0]);
        
        // Analisar src das imagens
        const srcMatches = html.match(/src=['"](.*?)['"]/gi);
        if (srcMatches) {
          console.log('  Fontes das imagens:');
          srcMatches.slice(0, 3).forEach((src, i) => {
            console.log(`    ${i + 1}. ${src}`);
          });
        }
      } else {
        console.log('  ❌ Nenhuma tag <img> encontrada no HTML');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjectDetails();