// Script para verificar imagens no banco de dados
async function checkImagesInDatabase() {
  try {
    console.log('🔍 Verificando imagens no banco de dados...\n');
    
    const response = await fetch('http://localhost:3000/api/projects');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const projects = await response.json();
    console.log(`📊 Total de projetos: ${projects.length}\n`);
    
    for (const project of projects) {
      console.log(`📁 Projeto: ${project.name} (ID: ${project.id})`);
      
      // Buscar detalhes do projeto
      const detailResponse = await fetch(`http://localhost:3000/api/projects/${project.id}`);
      
      if (detailResponse.ok) {
        const details = await detailResponse.json();
        
        // Verificar imagens em diferentes estruturas
        const images1 = details.images || [];
        const images2 = details.data?.additionalResources?.images || [];
        
        console.log(`   📸 Imagens diretas: ${images1.length}`);
        console.log(`   📸 Imagens em additionalResources: ${images2.length}`);
        
        if (images1.length > 0) {
          images1.forEach((img, i) => {
            if (typeof img === 'string') {
              console.log(`     ${i + 1}. ${img.substring(0, 100)}...`);
            } else if (img && img.url) {
              console.log(`     ${i + 1}. [${img.position}] ${img.filename} - ${img.url.substring(0, 60)}...`);
            }
          });
        }
        
        if (images2.length > 0 && images2 !== images1) {
          console.log(`   📸 Imagens em data.additionalResources:`);
          images2.forEach((img, i) => {
            if (typeof img === 'string') {
              console.log(`     ${i + 1}. ${img.substring(0, 100)}...`);
            } else if (img && img.url) {
              console.log(`     ${i + 1}. [${img.position}] ${img.filename} - ${img.url.substring(0, 60)}...`);
            }
          });
        }
        
        if (images1.length === 0 && images2.length === 0) {
          console.log(`   ❌ Nenhuma imagem encontrada`);
        }
      } else {
        console.log(`   ❌ Erro ao buscar detalhes: ${detailResponse.status}`);
      }
      
      console.log(''); // linha vazia
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Aguardar um pouco para o servidor inicializar
setTimeout(() => {
  checkImagesInDatabase();
}, 3000);