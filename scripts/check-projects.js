const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProjects() {
  try {
    console.log('🔍 Verificando projetos no banco...');
    
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        data: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log(`📊 Total de projetos encontrados: ${projects.length}`);
    
    if (projects.length === 0) {
      console.log('❌ Nenhum projeto encontrado no banco');
      return;
    }
    
    console.log('\n📝 Projetos recentes:');
    projects.forEach((project, index) => {
      const hasHtml = project.data?.generatedContent?.html ? '✅ Tem HTML' : '❌ Sem HTML';
      console.log(`  ${index + 1}. ${project.name} (${project.status}) - ${hasHtml}`);
      console.log(`     ID: ${project.id}`);
      console.log(`     Preview: http://localhost:3001/preview/${project.id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjects();