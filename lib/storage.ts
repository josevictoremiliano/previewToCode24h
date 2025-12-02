import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getMinIOConfig } from '@/lib/system-config';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import { format } from 'date-fns';
import { randomUUID } from 'crypto';

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
 * Faz upload de uma imagem genérica (base64 ou URL) para um caminho específico
 */
export async function uploadGenericImage(
  imageData: string,
  keyWithoutExtension: string
): Promise<UploadResult> {
  try {
    let buffer: Buffer;
    let contentType: string;

    if (imageData.startsWith('data:')) {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) throw new Error('Formato base64 inválido');
      contentType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else if (imageData.startsWith('blob:') || imageData.startsWith('http')) {
      const response = await fetch(imageData);
      if (!response.ok) throw new Error(`Erro ao buscar imagem: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = response.headers.get('content-type') || 'image/jpeg';
    } else {
      throw new Error('Formato de imagem não suportado');
    }

    // Upload direto sem conversão (para uso genérico)
    return uploadFile(buffer, keyWithoutExtension, contentType);
  } catch (error) {
    console.error('Erro em uploadGenericImage:', error);
    throw error;
  }
}

/**
 * Faz upload de imagem a partir de uma blob URL ou base64
 * Converte para WebP e organiza em pastas específicas
 */
export async function uploadImage(
  imageData: string,
  projectId: string,
  imageName: string = 'image',
  projectContext?: { userId: string; name: string; createdAt: Date | string }
): Promise<UploadResult> {
  try {
    // 1. Obter dados do projeto
    let project = projectContext;
    if (!project) {
      const p = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true, name: true, createdAt: true }
      });
      if (!p) throw new Error(`Projeto não encontrado: ${projectId}`);
      project = p;
    }

    // 2. Converter imagem para Buffer
    let buffer: Buffer;
    if (imageData.startsWith('data:')) {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) throw new Error('Formato base64 inválido');
      buffer = Buffer.from(matches[2], 'base64');
    } else if (imageData.startsWith('http') || imageData.startsWith('blob:')) {
      const response = await fetch(imageData);
      if (!response.ok) throw new Error(`Erro ao buscar imagem: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error('Formato de imagem não suportado');
    }

    // 3. Converter para WebP usando Sharp
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    // 4. Construir caminho do arquivo
    // Folder: userID/ProjetoName_DiaDeCriação/fotos/
    // File: DataDeUploadProjetoName0001.webp

    const createdAtDate = new Date(project.createdAt);
    const creationDateStr = format(createdAtDate, 'ddMMyyyy');
    const uploadDateStr = format(new Date(), 'ddMMyyyy');
    const safeProjectName = project.name.replace(/[^a-zA-Z0-9]/g, '');

    let fileName = '';
    if (imageName === 'logo') {
      fileName = `${uploadDateStr}${safeProjectName}_logo.webp`;
    } else {
      // Tenta extrair índice se for algo como "additional-0"
      const match = imageName.match(/additional-(\d+)/);
      const index = match ? parseInt(match[1]) + 1 : 1;
      const sequence = index.toString().padStart(4, '0');
      fileName = `${uploadDateStr}${safeProjectName}${sequence}.webp`;
    }

    const key = `${project.userId}/${safeProjectName}_${creationDateStr}/fotos/${fileName}`;

    // 5. Upload
    return uploadFile(webpBuffer, key, 'image/webp');

  } catch (error) {
    console.error('Erro em uploadImage:', error);
    throw error;
  }
}

/**
 * Gera URL assinada para acesso temporário (se necessário)
 */
export async function generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const config = await getMinIOConfigFromDB();
    const s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: config.credentials,
      forcePathStyle: config.forcePathStyle
    });

    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error);
    throw new Error(`Falha ao gerar URL: ${(error as Error).message}`);
  }
}

/**
 * Verifica se um arquivo existe no bucket
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const config = await getMinIOConfigFromDB();
    const s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: config.credentials,
      forcePathStyle: config.forcePathStyle
    });

    await s3Client.send(new HeadObjectCommand({
      Bucket: config.bucket,
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
export async function processProjectImages(
  projectData: any,
  projectContext?: { userId: string; name: string; createdAt: Date }
): Promise<any> {
  try {
    const updatedData = { ...projectData };
    const projectId = updatedData.projectId || 'unknown';

    // Se não tiver contexto e tiver projectId, buscar contexto uma vez
    if (!projectContext && projectId !== 'unknown') {
      const p = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true, name: true, createdAt: true }
      });
      if (p) projectContext = p;
    }

    // Processar logo na visualIdentity
    if (updatedData.visualIdentity?.logoUrl &&
      (updatedData.visualIdentity.logoUrl.startsWith('blob:') ||
        updatedData.visualIdentity.logoUrl.startsWith('data:'))) {

      console.log('🖼️ Fazendo upload do logo...');
      const logoResult = await uploadImage(
        updatedData.visualIdentity.logoUrl,
        projectId,
        'logo',
        projectContext
      );
      updatedData.visualIdentity.logoUrl = logoResult.url;
      console.log('✅ Logo uploaded:', logoResult.url);
    }

    // Processar imagens em additionalResources
    if (updatedData.additionalResources?.images?.length > 0) {
      console.log(`🖼️ Processando ${updatedData.additionalResources.images.length} imagens adicionais...`);

      for (let i = 0; i < updatedData.additionalResources.images.length; i++) {
        const image = updatedData.additionalResources.images[i];

        // Se for objeto com url (estrutura nova)
        if (image && typeof image === 'object' && image.url &&
          (image.url.startsWith('blob:') || image.url.startsWith('data:'))) {

          const imageResult = await uploadImage(image.url, projectId, `additional-${i}`, projectContext);
          updatedData.additionalResources.images[i].url = imageResult.url;
          console.log(`✅ Imagem ${i + 1} uploaded:`, imageResult.url);

        } else if (typeof image === 'string' &&
          (image.startsWith('blob:') || image.startsWith('data:'))) {
          // Se for string direta (legado ou simplificado)
          const imageResult = await uploadImage(image, projectId, `additional-${i}`, projectContext);
          updatedData.additionalResources.images[i] = imageResult.url;
          console.log(`✅ Imagem ${i + 1} uploaded:`, imageResult.url);
        }
      }
    }

    // Processar outras possíveis imagens no JSON (recursivo)
    const processImageField = async (obj: any, path: string[] = []): Promise<void> => {
      for (const [key, value] of Object.entries(obj)) {
        // Pular campos já processados
        if (path.includes('visualIdentity') && key === 'logoUrl') continue;
        if (path.includes('additionalResources') && key === 'images') continue;

        if (typeof value === 'string' &&
          (value.startsWith('blob:') || value.startsWith('data:image'))) {

          const fieldName = [...path, key].join('-');
          const imageResult = await uploadImage(value, projectId, fieldName, projectContext);
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
  uploadGenericImage,
  uploadImage,
  generateSignedUrl,
  fileExists,
  processProjectImages,
};