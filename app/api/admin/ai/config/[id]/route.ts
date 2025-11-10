import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Função para criptografar API key (usando fallback por compatibilidade)
function encryptApiKey(apiKey: string): string {
  try {
    // Por enquanto, usar base64 simples até resolver problema com GCM
    return Buffer.from(apiKey).toString('base64')
  } catch (error) {
    console.error('Erro ao criptografar chave:', error)
    return Buffer.from(apiKey).toString('base64')
  }
}

async function handlePut(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { provider, apiKey, model, maxTokens, temperature, description, isActive } = body

    // Validações
    if (!provider || !model) {
      return NextResponse.json(
        { error: 'Provider e Model são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a configuração existe
    const existingConfig = await prisma.aiConfig.findUnique({
      where: { id }
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização
    const updateData: {
      provider: string
      model: string
      maxTokens: number
      temperature: number
      description?: string
      isActive: boolean
      apiKey?: string
    } = {
      provider,
      model,
      maxTokens: maxTokens || 4000,
      temperature: temperature || 0.7,
      description,
      isActive: isActive !== false
    }

    // Só atualizar API key se foi fornecida
    if (apiKey) {
      updateData.apiKey = encryptApiKey(apiKey)
    }

    // Desativar outras configurações se esta for ativa
    if (isActive !== false) {
      await prisma.aiConfig.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false }
      })
    }

    const updatedConfig = await prisma.aiConfig.update({
      where: { id },
      data: updateData,
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

    // Remover API key da resposta
    const safeConfig = {
      ...updatedConfig,
      apiKey: '***' + updatedConfig.apiKey.slice(-4),
      hasApiKey: Boolean(updatedConfig.apiKey)
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error('Erro ao atualizar configuração de IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleDelete(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verificar se a configuração existe
    const existingConfig = await prisma.aiConfig.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usageLogs: true
          }
        }
      }
    })

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuração não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há logs de uso
    if (existingConfig._count.usageLogs > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir configuração com histórico de uso' },
        { status: 400 }
      )
    }

    await prisma.aiConfig.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir configuração de IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const PUT = withAdminAuth(handlePut)
export const DELETE = withAdminAuth(handleDelete)