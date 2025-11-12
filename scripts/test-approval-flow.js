const { PrismaClient } = require('@prisma/client');

async function testApprovalFlow() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Testando fluxo completo de aprovação...\n');

    // 1. Verificar projeto existente
    const projectId = 'cmhtgjwau000do80je5p7oiym'; // Projeto Marinha
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    });
    
    if (!project) {
      console.log('❌ Projeto não encontrado');
      return;
    }
    
    console.log('📋 Projeto encontrado:');
    console.log(`  Nome: ${project.name}`);
    console.log(`  Status atual: ${project.status}`);
    console.log(`  Usuário: ${project.user?.email}`);
    
    // 2. Simular aprovação pelo admin (se ainda estiver PENDING)
    if (project.status === 'PENDING') {
      console.log('\n🔄 Alterando status para PENDING para testar...');
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'PENDING' }
      });
    }
    
    console.log('\n📞 Teste: Chamando endpoint de aprovação...');
    
    // 3. Testar chamada para o endpoint (simulado)
    const testUrl = `http://localhost:3001/api/projects/${projectId}/approve`;
    console.log(`  URL: ${testUrl}`);
    console.log('  Método: POST');
    console.log('  Body: { "action": "admin_approve" }');
    
    console.log('\n⚠️  PRÓXIMOS PASSOS MANUAIS:');
    console.log('1. Adicione a senha do MinIO ao .env.local');
    console.log('2. Reinicie o servidor: npm run dev');
    console.log('3. Teste o endpoint com:');
    console.log(`   curl -X POST "${testUrl}" \\`);
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"action": "admin_approve"}\'');
    console.log('\n4. Ou abra o browser em: http://localhost:3001/admin');
    
    // 4. Verificar notificações existentes
    const notifications = await prisma.notification.findMany({
      where: { userId: project.userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`\n📧 Notificações existentes do usuário (${notifications.length}):`);
    notifications.forEach((notif, i) => {
      console.log(`  ${i + 1}. ${notif.title} (${notif.read ? 'Lida' : 'Não lida'})`);
      console.log(`     ${notif.message}`);
      console.log(`     Criada: ${notif.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testApprovalFlow();