const { PrismaClient } = require('@prisma/client');

async function checkImageStructure() {
  const prisma = new PrismaClient();
  
  try {
    const project = await prisma.project.findUnique({
      where: { id: 'cmhtgjwau000do80je5p7oiym' }
    });
    
    console.log('🖼️ Estrutura de imagens detalhada:\n');
    
    // Examinar visualIdentity
    if (project.data.visualIdentity) {
      console.log('📋 Visual Identity:');
      console.log(JSON.stringify(project.data.visualIdentity, null, 2));
    }
    
    // Examinar basicInfo
    if (project.data.basicInfo) {
      console.log('\n📊 Basic Info:');
      console.log(JSON.stringify(project.data.basicInfo, null, 2));
    }
    
    // Examinar additionalResources
    if (project.data.additionalResources) {
      console.log('\n📚 Additional Resources:');
      console.log(JSON.stringify(project.data.additionalResources, null, 2));
    }
    
    // Procurar por qualquer campo que contenha "data:" (base64) ou URLs
    const dataStr = JSON.stringify(project.data);
    
    console.log('\n🔍 Análise de possíveis imagens:');
    
    // Base64 images
    const base64Matches = dataStr.match(/data:image\/[^"]+/g);
    if (base64Matches) {
      console.log(`  📸 ${base64Matches.length} imagens em base64 encontradas`);
      base64Matches.forEach((match, i) => {
        console.log(`    ${i + 1}. ${match.substring(0, 50)}...`);
      });
    }
    
    // URLs de imagem
    const urlMatches = dataStr.match(/https?:\/\/[^"]*\.(jpg|jpeg|png|gif|webp|svg)/gi);
    if (urlMatches) {
      console.log(`  🌐 ${urlMatches.length} URLs de imagem encontradas`);
      urlMatches.forEach((match, i) => {
        console.log(`    ${i + 1}. ${match}`);
      });
    }
    
    // Verificar se há file paths ou blob URLs
    const fileMatches = dataStr.match(/blob:[^"]+|file:[^"]+/gi);
    if (fileMatches) {
      console.log(`  📁 ${fileMatches.length} file/blob URLs encontradas`);
      fileMatches.forEach((match, i) => {
        console.log(`    ${i + 1}. ${match}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageStructure();