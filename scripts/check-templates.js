const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    console.log('🔍 Verificando templates no banco...');
    
    const templates = await prisma.promptTemplate.findMany({
      select: {
        id: true,
        key: true,
        name: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Total de templates: ${templates.length}`);
    console.log('\n📝 Templates encontrados:');
    templates.forEach(template => {
      console.log(`  ✅ ${template.key} - ${template.name} (Ativo: ${template.isActive})`);
    });
    
    // Verificar especificamente os templates que estamos procurando
    const copyTemplate = await prisma.promptTemplate.findFirst({
      where: { key: 'copy_creation', isActive: true }
    });
    
    const htmlTemplate = await prisma.promptTemplate.findFirst({
      where: { key: 'html_generation', isActive: true }
    });
    
    console.log('\n🎯 Status dos templates necessários:');
    console.log(`  📄 copy_creation: ${copyTemplate ? '✅ Encontrado' : '❌ Não encontrado'}`);
    console.log(`  💻 html_generation: ${htmlTemplate ? '✅ Encontrado' : '❌ Não encontrado'}`);
    
    if (htmlTemplate) {
      console.log(`     ID: ${htmlTemplate.id}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();