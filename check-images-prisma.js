import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImagesInPrisma() {
  try {
    console.log('🔍 Verificando imagens no banco via Prisma...\n');
    
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        data: true
      }
    });
    
    console.log(`📊 Total de projetos: ${projects.length}\n`);
    
    for (const project of projects) {
      console.log(`📁 Projeto: ${project.name} (ID: ${project.id})`);
      
      const data = project.data;
      
      if (data && typeof data === 'object') {
        // Verificar diferentes estruturas de dados
        const additionalResources = data.additionalResources;
        const images = additionalResources?.images;
        
        console.log(`   📦 Dados do projeto:`, JSON.stringify(data).length, 'caracteres');
        
        if (images && Array.isArray(images)) {
          console.log(`   📸 Imagens encontradas: ${images.length}`);
          
          images.forEach((img, i) => {
            if (typeof img === 'string') {
              console.log(`     ${i + 1}. STRING: ${img.substring(0, 100)}...`);
            } else if (img && typeof img === 'object') {
              console.log(`     ${i + 1}. OBJECT:`, {
                url: img.url ? img.url.substring(0, 60) + '...' : 'NO URL',
                position: img.position || 'NO POSITION',
                filename: img.filename || 'NO FILENAME',
                id: img.id || 'NO ID'
              });
            } else {
              console.log(`     ${i + 1}. UNKNOWN TYPE:`, typeof img);
            }
          });
        } else {
          console.log(`   ❌ Nenhuma imagem em additionalResources.images`);
        }
        
        // Verificar outras possíveis localizações
        if (data.images) {
          console.log(`   📸 Imagens em data.images: ${data.images.length || 'N/A'}`);
        }
        
        if (data.visualIdentity?.logoUrl) {
          console.log(`   🏷️ Logo encontrado: ${data.visualIdentity.logoUrl.substring(0, 60)}...`);
        }
      } else {
        console.log(`   ❌ Nenhum dado JSON encontrado`);
      }
      
      console.log(''); // linha vazia
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImagesInPrisma();