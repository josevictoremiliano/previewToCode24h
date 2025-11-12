import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Chave para criptografia (em produção deve vir do .env)
const ENCRYPTION_KEY = process.env.SYSTEM_CONFIG_KEY || 'your-32-char-secret-key-here-123!'

interface ConfigValue {
  key: string
  value: string | null
  encrypted?: boolean
  category?: string
  description?: string
}

/**
 * Criptografa um valor sensível
 */
function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const iv = crypto.randomBytes(16)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Descriptografa um valor
 */
function decrypt(encryptedText: string): string {
  try {
    const algorithm = 'aes-256-cbc'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const parts = encryptedText.split(':')
    
    if (parts.length !== 2) {
      throw new Error('Formato inválido')
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Erro ao descriptografar:', error)
    return encryptedText // Retorna o texto original se não conseguir descriptografar
  }
}

/**
 * Salva ou atualiza uma configuração
 */
export async function setSystemConfig(
  key: string, 
  value: string | null, 
  options: {
    encrypted?: boolean
    category?: string
    description?: string
    userId: string
  }
): Promise<void> {
  try {
    const finalValue = options.encrypted && value ? encrypt(value) : value

    await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: finalValue,
        encrypted: options.encrypted || false,
        category: options.category || 'general',
        description: options.description,
        updatedAt: new Date()
      },
      create: {
        key,
        value: finalValue,
        encrypted: options.encrypted || false,
        category: options.category || 'general',
        description: options.description,
        createdById: options.userId
      }
    })

    console.log(`✅ Configuração salva: ${key}`)
  } catch (error) {
    console.error(`❌ Erro ao salvar configuração ${key}:`, error)
    throw new Error(`Falha ao salvar configuração: ${error}`)
  }
}

/**
 * Busca uma configuração
 */
export async function getSystemConfig(key: string): Promise<string | null> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key, isActive: true }
    })

    if (!config || !config.value) {
      return null
    }

    return config.encrypted ? decrypt(config.value) : config.value
  } catch (error) {
    console.error(`❌ Erro ao buscar configuração ${key}:`, error)
    return null
  }
}

/**
 * Busca todas as configurações de uma categoria
 */
export async function getSystemConfigsByCategory(category: string): Promise<Record<string, string | null>> {
  try {
    const configs = await prisma.systemConfig.findMany({
      where: { 
        category,
        isActive: true 
      }
    })

    const result: Record<string, string | null> = {}

    for (const config of configs) {
      if (config.value) {
        result[config.key] = config.encrypted ? decrypt(config.value) : config.value
      } else {
        result[config.key] = null
      }
    }

    return result
  } catch (error) {
    console.error(`❌ Erro ao buscar configurações da categoria ${category}:`, error)
    return {}
  }
}

/**
 * Lista todas as configurações (para interface admin)
 */
export async function getAllSystemConfigs(): Promise<Array<{
  id: string
  key: string
  value: string
  encrypted: boolean
  category: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: { name: string | null; email: string }
}>> {
  try {
    console.log('🔍 Buscando todas as configurações...')
    const configs = await prisma.systemConfig.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ],
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`📋 Encontradas ${configs.length} configurações ativas`)

    // Não retornar valores criptografados na listagem
    const result = configs.map(config => ({
      ...config,
      value: config.encrypted ? '***ENCRYPTED***' : config.value
    }))
    
    console.log('📤 Retornando configurações:', result.map(c => ({ key: c.key, category: c.category })))
    return result
  } catch (error) {
    console.error('❌ Erro ao buscar todas as configurações:', error)
    return []
  }
}

/**
 * Remove uma configuração
 */
export async function deleteSystemConfig(key: string): Promise<void> {
  try {
    await prisma.systemConfig.update({
      where: { key },
      data: { isActive: false }
    })

    console.log(`✅ Configuração removida: ${key}`)
  } catch (error) {
    console.error(`❌ Erro ao remover configuração ${key}:`, error)
    throw new Error(`Falha ao remover configuração: ${error}`)
  }
}

/**
 * Configurações pré-definidas do MinIO
 */
export const MINIO_CONFIG_KEYS = {
  ENDPOINT: 'minio_endpoint',
  ACCESS_KEY: 'minio_access_key',
  SECRET_KEY: 'minio_secret_key',
  BUCKET: 'minio_bucket',
  REGION: 'minio_region'
} as const

/**
 * Configurações pré-definidas de SMTP
 */
export const SMTP_CONFIG_KEYS = {
  HOST: 'smtp_host',
  PORT: 'smtp_port',
  USER: 'smtp_user',
  PASSWORD: 'smtp_password',
  FROM_EMAIL: 'smtp_from_email',
  FROM_NAME: 'smtp_from_name'
} as const

/**
 * Busca configurações do MinIO
 */
export async function getMinIOConfig(): Promise<Record<string, string | null>> {
  return await getSystemConfigsByCategory('minio')
}

/**
 * Busca configurações de SMTP
 */
export async function getSMTPConfig(): Promise<Record<string, string | null>> {
  return await getSystemConfigsByCategory('smtp')
}

const systemConfigService = {
  setSystemConfig,
  getSystemConfig,
  getSystemConfigsByCategory,
  getAllSystemConfigs,
  deleteSystemConfig,
  getMinIOConfig,
  getSMTPConfig,
  MINIO_CONFIG_KEYS,
  SMTP_CONFIG_KEYS
}

export default systemConfigService