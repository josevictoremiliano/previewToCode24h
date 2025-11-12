import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateBlobImagesToMinIO() {
  try {
    console.log('🚀 Migrando imagens blob: para MinIO...\n');
    
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        data: true
      }
    });
    
    console.log(`📊 Verificando ${projects.length} projetos...\n`);
    
    for (const project of projects) {
      console.log(`📁 Projeto: ${project.name}`);
      
      const data = project.data;
      let hasUpdates = false;
      
      if (data && typeof data === 'object') {
        const updatedData = { ...data };
        
        // Migrar imagens em additionalResources
        if (updatedData.additionalResources?.images) {
          const images = updatedData.additionalResources.images;
          
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            if (image && typeof image === 'object' && image.url?.startsWith('blob:')) {
              console.log(`   🔄 Removendo imagem blob: ${image.filename}`);
              
              // Marcar para remoção (URL blob não funciona)
              images[i] = null;
              hasUpdates = true;
            }
          }
          
          // Filtrar imagens nulas
          updatedData.additionalResources.images = images.filter(img => img !== null);
        }
        
        // Migrar logo se for blob
        if (updatedData.visualIdentity?.logoUrl?.startsWith('blob:')) {
          console.log(`   🔄 Removendo logo blob:`);
          delete updatedData.visualIdentity.logoUrl;
          hasUpdates = true;
        }
        
        // Atualizar projeto se houve mudanças
        if (hasUpdates) {
          await prisma.project.update({
            where: { id: project.id },
            data: { data: updatedData }
          });
          
          console.log(`   ✅ Projeto atualizado - imagens blob removidas`);
        } else {
          console.log(`   ✅ Nenhuma imagem blob encontrada`);
        }
      }
      
      console.log('');
    }
    
    console.log('🎉 Migração concluída!');
    console.log('💡 Agora você pode fazer upload das imagens novamente e elas irão para o MinIO.');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBlobImagesToMinIO();