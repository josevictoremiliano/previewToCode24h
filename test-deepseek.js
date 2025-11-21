const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDeepSeek() {
  try {
    // Buscar config ativa
    const config = await prisma.aiConfig.findFirst({
      where: { isActive: true }
    });
    
    if (!config) {
      console.error('❌ Nenhuma configuração ativa encontrada');
      process.exit(1);
    }
    
    console.log('✅ Configuração Ativa:');
    console.log('Provider:', config.provider);
    console.log('Model:', config.model);
    console.log('API Endpoint:', config.apiEndpoint || 'https://api.deepseek.com/chat/completions');
    console.log('Max Tokens:', config.maxTokens);
    console.log('Temperature:', config.temperature);
    
    // Decodificar chave
    const decodedKey = Buffer.from(config.apiKey, 'base64').toString('utf8');
    console.log('Chave válida:', decodedKey.startsWith('sk-') ? '✅ SIM' : '❌ NÃO');
    console.log('Chave preview:', decodedKey.substring(0, 10) + '...');
    
    // Testar conexão com API
    console.log('\n🧪 Testando conexão com DeepSeek API...');
    const testResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${decodedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: 'Teste rápido - responda com OK' }
        ],
        max_tokens: 10,
        temperature: 0.7,
      }),
    });
    
    if (testResponse.ok) {
      const result = await testResponse.json();
      console.log('✅ DeepSeek API respondeu com sucesso!');
      console.log('Resposta:', result.choices?.[0]?.message?.content);
      console.log('Tokens used:', result.usage);
    } else {
      const error = await testResponse.json();
      console.error('❌ Erro:', testResponse.status, error);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testDeepSeek();
