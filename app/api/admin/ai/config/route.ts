import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

// Função para criptografar API key
function encryptApiKey(apiKey: string): string {
  try {
    const algorithm = 'aes-256-gcm'
    const secretKey = process.env.ENCRYPTION_SECRET || 'your-secret-key-change-in-production'
    const key = crypto.scryptSync(secretKey, 'salt', 32)
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipherGCM(algorithm, key, iv)
    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Erro ao criptografar chave:', error)
    // Fallback para base64 simples se criptografia falhar
    return Buffer.from(apiKey).toString('base64')
  }
}

// Função para descriptografar API key
function decryptApiKey(encryptedKey: string): string {
  try {
    // Verificar se é base64 simples (fallback)
    if (!encryptedKey.includes(':')) {
      return Buffer.from(encryptedKey, 'base64').toString('utf8')
    }
    
    const algorithm = 'aes-256-gcm'
    const secretKey = process.env.ENCRYPTION_SECRET || 'your-secret-key-change-in-production'
    const key = crypto.scryptSync(secretKey, 'salt', 32)
    
    const parts = encryptedKey.split(':')
    if (parts.length !== 3) {
      throw new Error('Formato inválido de chave criptografada')
    }
    
    const [ivHex, authTagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipherGCM(algorithm, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Erro ao descriptografar chave:', error)
    return ''
  }
}

async function handleGet(request: NextRequest) {
  try {
    const configs = await prisma.aiConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            usageLogs: true
          }
        }
      }
    })

    // Remover chaves API dos dados retornados por segurança
    const safeConfigs = configs.map(config => ({
      ...config,
      apiKey: '***' + config.apiKey.slice(-4), // Mostrar apenas últimos 4 chars
      hasApiKey: Boolean(config.apiKey)
    }))

    return NextResponse.json(safeConfigs)
  } catch (error) {
    console.error('Erro ao buscar configurações de IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handlePost(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { provider, apiKey, model, maxTokens, temperature, description } = body

    // Validações
    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { error: 'Provider, API Key e Model são obrigatórios' },
        { status: 400 }
      )
    }

    // Desativar outras configurações se esta for ativa
    if (body.isActive !== false) {
      await prisma.aiConfig.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    // Criptografar API key
    const encryptedApiKey = encryptApiKey(apiKey)

    const config = await prisma.aiConfig.create({
      data: {
        provider,
        apiKey: encryptedApiKey,
        model,
        maxTokens: maxTokens || 4000,
        temperature: temperature || 0.7,
        description,
        isActive: body.isActive !== false,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Remover API key da resposta
    const safeConfig = {
      ...config,
      apiKey: '***' + config.apiKey.slice(-4),
      hasApiKey: Boolean(config.apiKey)
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error('Erro ao criar configuração de IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handleGet)
export const POST = withAdminAuth(handlePost)