const { PrismaClient } = require('@prisma/client');

async function testSystemConfig() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testando sistema de configurações...\n');
    
    // Verificar se a tabela existe
    console.log('1. Verificando tabela system_configs...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'system_configs';
    `;
    console.log('Tabelas encontradas:', tables);
    
    // Verificar configurações existentes
    console.log('\n2. Configurações existentes:');
    const configs = await prisma.systemConfig.findMany();
    console.log(`Total: ${configs.length}`);
    configs.forEach(config => {
      console.log(`  - ${config.key}: ${config.value} (${config.category})`);
    });
    
    // Testar criação de uma configuração
    console.log('\n3. Testando criação de configuração...');
    const testConfig = await prisma.systemConfig.create({
      data: {
        key: 'test_config_' + Date.now(),
        value: 'test_value',
        category: 'test',
        description: 'Teste de configuração',
        createdById: 'admin-test' // Substitua por um ID válido
      }
    });
    console.log('✅ Configuração de teste criada:', testConfig.key);
    
    // Remover configuração de teste
    await prisma.systemConfig.delete({
      where: { id: testConfig.id }
    });
    console.log('✅ Configuração de teste removida');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.log('\nDetalhes do erro:');
    console.log('  Tipo:', error.constructor.name);
    console.log('  Mensagem:', error.message);
    if (error.code) console.log('  Código:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testSystemConfig();