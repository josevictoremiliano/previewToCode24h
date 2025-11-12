import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAndFixImageUrls() {
  try {
    console.log('🔍 Investigando URLs das imagens...\n');
    
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        data: true
      }
    });
    
    for (const project of projects) {
      console.log(`📁 Projeto: ${project.name} (${project.id})`);
      
      const data = project.data;
      let hasUpdates = false;
      
      if (data && typeof data === 'object') {
        const updatedData = { ...data };
        
        // Debug imagens em additionalResources
        if (updatedData.additionalResources?.images) {
          const images = updatedData.additionalResources.images;
          
          console.log(`   📸 Encontradas ${images.length} imagens:`);
          
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            if (image && typeof image === 'object') {
              console.log(`     ${i + 1}. ${image.filename}`);
              console.log(`        URL atual: ${image.url}`);
              console.log(`        Posição: ${image.position}`);
              
              if (image.url?.startsWith('blob:')) {
                // Mapear para MinIO baseado nos arquivos que vimos no console
                let minioUrl;
                
                if (image.filename === '6984546e-b5fc-42a9-824a-cddc1ba824ef.png') {
                  minioUrl = 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/cmhtzq3t90044gdkwh633ig7h/images/6984546e-b5fc-42a9-824a-cddc1ba824ef.png';
                } else if (image.filename === 'sala.webp') {
                  // Verificar se existe como .webp ou foi convertido
                  minioUrl = 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/cmhtzq3t90044gdkwh633ig7h/images/Gemini_Generated_Image_catzkjcatzkjcatz.webp';
                } else {
                  // Padrão geral
                  minioUrl = `https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/${project.id}/images/${image.filename}`;
                }
                
                console.log(`        🔄 Corrigindo para: ${minioUrl}`);
                
                // Atualizar URL
                images[i] = { ...image, url: minioUrl };
                hasUpdates = true;
              } else if (image.url?.startsWith('https://minio-')) {
                console.log(`        ✅ URL já correta (MinIO)`);
              } else {
                console.log(`        ⚠️ URL desconhecida: ${image.url?.substring(0, 50)}...`);
              }
            }
          }
        }
        
        // Debug logo
        if (updatedData.visualIdentity?.logoUrl) {
          console.log(`   🏷️ Logo URL: ${updatedData.visualIdentity.logoUrl}`);
          
          if (updatedData.visualIdentity.logoUrl.startsWith('blob:')) {
            const logoUrl = 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/cmhtzq3t90044gdkwh633ig7h/images/6984546e-b5fc-42a9-824a-cddc1ba824ef.png';
            
            console.log(`   🔄 Corrigindo logo para: ${logoUrl}`);
            updatedData.visualIdentity.logoUrl = logoUrl;
            hasUpdates = true;
          }
        }
        
        // Atualizar projeto se houve mudanças
        if (hasUpdates) {
          await prisma.project.update({
            where: { id: project.id },
            data: { data: updatedData }
          });
          
          console.log(`   ✅ Projeto atualizado com URLs do MinIO`);
        } else {
          console.log(`   ✅ Nenhuma atualização necessária`);
        }
      }
      
      console.log('');
    }
    
    console.log('🎉 Investigação e correção concluídas!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAndFixImageUrls();