import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImageUrls() {
  try {
    console.log('🔧 Corrigindo URLs das imagens para MinIO...\n');
    
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        data: true
      }
    });
    
    for (const project of projects) {
      console.log(`📁 Projeto: ${project.name}`);
      
      const data = project.data;
      let hasUpdates = false;
      
      if (data && typeof data === 'object') {
        const updatedData = { ...data };
        
        // Corrigir imagens em additionalResources
        if (updatedData.additionalResources?.images) {
          const images = updatedData.additionalResources.images;
          
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            if (image && typeof image === 'object' && image.url?.startsWith('blob:')) {
              // Tentar mapear para URL do MinIO baseada no filename
              const filename = image.filename;
              
              if (filename) {
                // Gerar URL do MinIO baseada no padrão
                const minioUrl = `https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/${project.id}/images/${filename}`;
                
                console.log(`   🔄 Corrigindo: ${filename}`);
                console.log(`      De: ${image.url.substring(0, 50)}...`);
                console.log(`      Para: ${minioUrl}`);
                
                // Atualizar URL
                images[i] = { ...image, url: minioUrl };
                hasUpdates = true;
              }
            }
          }
        }
        
        // Corrigir logo se for blob
        if (updatedData.visualIdentity?.logoUrl?.startsWith('blob:')) {
          // Tentar gerar URL do MinIO para logo
          const logoUrl = `https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/${project.id}/images/logo.png`;
          
          console.log(`   🔄 Corrigindo logo:`);
          console.log(`      Para: ${logoUrl}`);
          
          updatedData.visualIdentity.logoUrl = logoUrl;
          hasUpdates = true;
        }
        
        // Atualizar projeto se houve mudanças
        if (hasUpdates) {
          await prisma.project.update({
            where: { id: project.id },
            data: { data: updatedData }
          });
          
          console.log(`   ✅ URLs corrigidas para MinIO`);
        } else {
          console.log(`   ✅ Nenhuma correção necessária`);
        }
      }
      
      console.log('');
    }
    
    console.log('🎉 Correção concluída!');
    console.log('💡 Agora as imagens devem aparecer corretamente do MinIO.');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls();