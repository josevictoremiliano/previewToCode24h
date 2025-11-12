// Teste de conexão com MinIO
async function testMinIOConnection() {
  try {
    console.log('🔍 Testando conexão com MinIO...\n');
    
    // Criar uma imagem base64 simples (pixel vermelho 1x1)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const response = await fetch('http://localhost:3000/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: testImageBase64,
        projectId: 'test-connection',
        imageName: 'test-pixel'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Conexão com MinIO bem-sucedida!');
      console.log('📁 URL da imagem:', result.url);
      console.log('🔑 Chave do arquivo:', result.key);
      console.log('📊 Tamanho:', result.size, 'bytes');
    } else {
      console.error('❌ Erro na conexão:');
      console.error('Status:', response.status);
      console.error('Erro:', result.error);
      console.error('Detalhes:', result.details);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

// Aguardar um pouco para o servidor inicializar
setTimeout(() => {
  testMinIOConnection();
}, 3000);