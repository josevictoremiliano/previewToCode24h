// Teste simples do MinIO
import { uploadImage } from '../lib/storage.js';

async function testMinIOUpload() {
  try {
    console.log('🧪 Testando upload para MinIO...');
    
    // Criar uma imagem base64 simples (1x1 pixel vermelho)
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const result = await uploadImage(testImage, 'test-project', 'test-image');
    
    console.log('✅ Upload bem-sucedido!');
    console.log('URL:', result.url);
    console.log('Key:', result.key);
    console.log('Size:', result.size);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMinIOUpload();