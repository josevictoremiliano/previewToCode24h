import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

async function handlePatch(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

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

    const newStatus = !existingConfig.isActive

    // Se estiver ativando, desativar outras configurações
    if (newStatus) {
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
      data: { isActive: newStatus },
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
    console.error('Erro ao alterar status da configuração de IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const PATCH = withAdminAuth(handlePatch)