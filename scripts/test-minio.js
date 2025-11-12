const fetch = require('node-fetch');

async function testMinIOConnection() {
  console.log('🔍 Testando conexão com MinIO...\n');

  const config = {
    endpoint: 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me',
    accessKey: 'kzNTeGwrChUpHmPn',
    // secretKey: 'PRECISA_DA_SENHA',
    bucket: 'seusiteem24h'
  };

  console.log('📋 Configuração:');
  console.log('  Endpoint:', config.endpoint);
  console.log('  Access Key:', config.accessKey);
  console.log('  Bucket:', config.bucket);

  // Teste básico - verificar se o endpoint responde
  try {
    console.log('\n🚀 Testando endpoint...');
    const response = await fetch(config.endpoint);
    console.log('✅ Endpoint acessível:', response.status);
  } catch (error) {
    console.log('❌ Erro no endpoint:', error.message);
  }

  console.log('\n⚠️  AÇÃO NECESSÁRIA:');
  console.log('1. Adicione a senha do MinIO ao arquivo .env.local:');
  console.log('   MINIO_SECRET_KEY=sua_senha_aqui');
  console.log('2. Verifique se o bucket "seusiteem24h" existe no console MinIO');
  console.log('   Console: https://console-rg4c04cc4k4c040ckckkk88c.painel.jotav.me');
}

testMinIOConnection();