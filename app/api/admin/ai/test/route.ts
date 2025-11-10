import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

import crypto from 'crypto'

// Função para descriptografar API key (mesma do config/route.ts)
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

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json()
    const { configId, testPrompt } = body

    if (!configId) {
      return NextResponse.json(
        { error: 'ID da configuração é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar configuração
    const config = await prisma.aiConfig.findUnique({
      where: { id: configId }
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      )
    }

    // Descriptografar API key
    const apiKey = decryptApiKey(config.apiKey)
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Erro ao descriptografar chave API' },
        { status: 500 }
      )
    }

    const prompt = testPrompt || "Teste de conexão: responda apenas 'Conexão OK' se você conseguir me ouvir."

    try {
      // Importar OpenAI dinamicamente
      const { default: OpenAI } = await import('openai')
      
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: config.provider === 'groq' ? 'https://api.groq.com/openai/v1' : undefined,
      })

      const startTime = Date.now()

      const completion = await client.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: Math.min(config.maxTokens, 100), // Limitar tokens para teste
        temperature: config.temperature,
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      const response = completion.choices[0]?.message?.content || 'Sem resposta'
      const usage = completion.usage

      // Log do uso (opcional)
      await prisma.aiUsageLog.create({
        data: {
          configId: config.id,
          inputTokens: usage?.prompt_tokens || 0,
          outputTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
          responseTime,
          success: true,
          userId: config.createdById
        }
      })

      return NextResponse.json({
        success: true,
        response,
        responseTime,
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0
        }
      })

    } catch (aiError: unknown) {
      console.error('Erro na API de IA:', aiError)

      const errorMessage = aiError instanceof Error ? aiError.message : 'Erro desconhecido'

      // Log do erro
      await prisma.aiUsageLog.create({
        data: {
          configId: config.id,
          success: false,
          errorMessage,
          userId: config.createdById
        }
      })

      return NextResponse.json(
        { 
          error: 'Erro na API de IA',
          details: errorMessage
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro ao testar IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuth(handlePost)