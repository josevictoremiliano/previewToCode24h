import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getMinIOConfig } from '@/lib/system-config';

let cachedMinIOConfig: any = null;
let configCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Busca configuração do MinIO do banco de dados
async function getMinIOConfigFromDB() {
  const now = Date.now();
  
  // Cache da configuração por 5 minutos
  if (cachedMinIOConfig && (now - configCacheTime) < CACHE_DURATION) {
    return cachedMinIOConfig;
  }

  try {
    const config = await getMinIOConfig();
    
    cachedMinIOConfig = {
      endpoint: config.minio_endpoint || process.env.MINIO_ENDPOINT || 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me',
      region: config.minio_region || process.env.MINIO_REGION || 'us-east-1',
      credentials: {
        accessKeyId: config.minio_access_key || process.env.MINIO_ACCESS_KEY || 'kzNTeGwrChUpHmPn',
        secretAccessKey: config.minio_secret_key || process.env.MINIO_SECRET_KEY || '',
      },
      forcePathStyle: true, // Necessário para MinIO
      bucket: config.minio_bucket || process.env.MINIO_BUCKET || 'seusiteem24h'
    };
    
    configCacheTime = now;
    return cachedMinIOConfig;
  } catch (error) {
    console.error('❌ Erro ao buscar configuração MinIO do banco:', error);
    
    // Fallback para variáveis de ambiente
    return {
      endpoint: process.env.MINIO_ENDPOINT || 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me',
      region: process.env.MINIO_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'kzNTeGwrChUpHmPn',
        secretAccessKey: process.env.MINIO_SECRET_KEY || '',
      },
      forcePathStyle: true,
      bucket: process.env.MINIO_BUCKET || 'seusiteem24h'
    };
  }
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

/**
 * Faz upload de um arquivo para o MinIO
 */
export async function uploadFile(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string = 'application/octet-stream'
): Promise<UploadResult> {
  try {
    const config = await getMinIOConfigFromDB();
    
    // Criar cliente S3 com configuração dinâmica
    const s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: config.credentials,
      forcePathStyle: config.forcePathStyle
    });

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      // ACL: 'public-read', // MinIO pode não suportar ACLs por padrão
    });

    await s3Client.send(command);

    // URL público do arquivo
    const url = `${config.endpoint}/${config.bucket}/${key}`;

    return {
      url,
      key,
      size: file.length,
    };
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw new Error(`Falha no upload: ${(error as Error).message}`);
  }
}

/**
 * Faz upload de imagem a partir de uma blob URL ou base64
 */
export async function uploadImage(
  imageData: string,
  projectId: string,
  imageName?: string
): Promise<UploadResult> {
  try {
    let buffer: Buffer;
    let contentType: string;
    
    if (imageData.startsWith('data:')) {
      // Base64 image
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Formato base64 inválido');
      }
      
      contentType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else if (imageData.startsWith('blob:') || imageData.startsWith('http')) {
      // Fetch da URL
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(`Erro ao buscar imagem: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = response.headers.get('content-type') || 'image/jpeg';
    } else {
      throw new Error('Formato de imagem não suportado');
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = contentType.split('/')[1] || 'jpg';
    const fileName = imageName || `image-${timestamp}`;
    const key = `projects/${projectId}/images/${fileName}.${extension}`;

    return await uploadFile(buffer, key, contentType);
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw new Error(`Falha no upload da imagem: ${error.message}`);
  }
}

/**
 * Gera URL assinada para acesso temporário (se necessário)
 */
export async function generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error);
    throw new Error(`Falha ao gerar URL: ${error.message}`);
  }
}

/**
 * Verifica se um arquivo existe no bucket
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Processa todas as imagens de um projeto e faz upload
 */
export async function processProjectImages(projectData: any): Promise<any> {
  try {
    const updatedData = { ...projectData };
    const projectId = updatedData.projectId || 'unknown';
    
    // Processar logo na visualIdentity
    if (updatedData.visualIdentity?.logoUrl && 
        (updatedData.visualIdentity.logoUrl.startsWith('blob:') || 
         updatedData.visualIdentity.logoUrl.startsWith('data:'))) {
      
      console.log('🖼️ Fazendo upload do logo...');
      const logoResult = await uploadImage(
        updatedData.visualIdentity.logoUrl,
        projectId,
        'logo'
      );
      updatedData.visualIdentity.logoUrl = logoResult.url;
      console.log('✅ Logo uploaded:', logoResult.url);
    }

    // Processar imagens em additionalResources
    if (updatedData.additionalResources?.images?.length > 0) {
      console.log(`🖼️ Processando ${updatedData.additionalResources.images.length} imagens adicionais...`);
      
      for (let i = 0; i < updatedData.additionalResources.images.length; i++) {
        const image = updatedData.additionalResources.images[i];
        
        if (typeof image === 'string' && 
            (image.startsWith('blob:') || image.startsWith('data:'))) {
          
          const imageResult = await uploadImage(image, projectId, `additional-${i}`);
          updatedData.additionalResources.images[i] = imageResult.url;
          console.log(`✅ Imagem ${i + 1} uploaded:`, imageResult.url);
        }
      }
    }

    // Processar outras possíveis imagens no JSON
    const processImageField = async (obj: any, path: string[] = []): Promise<void> => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && 
            (value.startsWith('blob:') || value.startsWith('data:image'))) {
          
          const fieldName = [...path, key].join('-');
          const imageResult = await uploadImage(value, projectId, fieldName);
          obj[key] = imageResult.url;
          console.log(`✅ Campo ${fieldName} uploaded:`, imageResult.url);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          await processImageField(value, [...path, key]);
        }
      }
    };

    await processImageField(updatedData);
    
    return updatedData;
  } catch (error) {
    console.error('Erro ao processar imagens do projeto:', error);
    throw error;
  }
}

export default {
  uploadFile,
  uploadImage,
  generateSignedUrl,
  fileExists,
  processProjectImages,
};