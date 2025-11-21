import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import type { AiConfig } from '@prisma/client'

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
  let config: AiConfig | null = null

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
    config = await prisma.aiConfig.findUnique({
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

    const startTime = Date.now()

    // Teste específico baseado no provider
    if (config.provider === 'v0') {
      // Teste para V0 usando fallback inteligente
      const v0Prompt = testPrompt || "Create a simple test button component with blue background and white text"
      
      console.log('🎨 Testando configuração V0 - usando fallback...')
      
      // Buscar configuração de fallback
      const fallbackConfig = await prisma.aiConfig.findFirst({
        where: { 
          provider: { in: ['groq', 'openai'] },
          isActive: false
        },
        orderBy: { createdAt: 'desc' }
      })

      if (!fallbackConfig) {
        throw new Error('Configuração V0 requer uma configuração de fallback (Groq ou OpenAI)')
      }

      const fallbackKey = decryptApiKey(fallbackConfig.apiKey)
      const { default: OpenAI } = await import('openai')
      
      const client = new OpenAI({
        apiKey: fallbackKey,
        baseURL: fallbackConfig.provider === 'groq' ? 'https://api.groq.com/openai/v1' : undefined,
      })

      const completion = await client.chat.completions.create({
        model: fallbackConfig.model,
        messages: [
          {
            role: 'system',
            content: 'You are v0, a professional UI generator. Create clean HTML components with inline CSS. Focus on modern design and responsiveness.'
          },
          {
            role: 'user',
            content: v0Prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime
      const generatedContent = completion.choices[0]?.message?.content || 'Sem resposta'
      const usage = completion.usage

      // Log do uso para V0
      await prisma.aiUsageLog.create({
        data: {
          configId: config.id,
          inputTokens: usage?.prompt_tokens || 0,
          outputTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
          responseTime,
          success: true,
          userId: config.createdById,
          metadata: {
            provider: 'v0',
            fallbackProvider: fallbackConfig.provider,
            fallbackModel: fallbackConfig.model
          }
        }
      })

      return NextResponse.json({
        success: true,
        response: `✨ V0 Simulado: ${generatedContent}`,
        responseTime,
        provider: 'v0',
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0
        }
      })
    } else {
      // Teste para outros providers (Groq, OpenAI, etc.)
      const prompt = testPrompt || "Teste de conexão: responda apenas 'Conexão OK' se você conseguir me ouvir."

      // Importar OpenAI dinamicamente
      const { default: OpenAI } = await import('openai')
      
      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: config.provider === 'groq' ? 'https://api.groq.com/openai/v1' : undefined,
      })

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
    }
  } catch (error: unknown) {
    console.error('Erro ao testar IA:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

    // Tentar registrar log de erro se tivermos a configuração carregada
    try {
      if (config && config.id) {
        await prisma.aiUsageLog.create({
          data: {
            configId: config.id,
            success: false,
            errorMessage,
            userId: config.createdById
          }
        })
      }
    } catch (logError) {
      console.error('Erro ao registrar log de uso:', logError)
    }

    return NextResponse.json(
      { 
        error: 'Erro na API de IA',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}


export const POST = withAdminAuth(handlePost)