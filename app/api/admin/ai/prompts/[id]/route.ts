import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const { name, key, prompt, description, category, variables, isActive } = body

    // Validações
    if (!name || !key || !prompt) {
      return NextResponse.json(
        { error: 'Nome, chave e prompt são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o template existe
    const existingTemplate = await prisma.promptTemplate.findUnique({
      where: { id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a chave já existe em outro template
    const duplicateKey = await prisma.promptTemplate.findFirst({
      where: { 
        key,
        id: { not: id }
      }
    })

    if (duplicateKey) {
      return NextResponse.json(
        { error: 'Chave já existe em outro template. Use uma chave única.' },
        { status: 400 }
      )
    }

    const updatedTemplate = await prisma.promptTemplate.update({
      where: { id },
      data: {
        name,
        key,
        prompt,
        description,
        category: category || 'general',
        variables: variables || [],
        isActive: isActive !== false
      },
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

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Erro ao atualizar template de prompt:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleDelete(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verificar se o template existe
    const existingTemplate = await prisma.promptTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usageLogs: true
          }
        }
      }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se há logs de uso
    if (existingTemplate._count.usageLogs > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir template com histórico de uso' },
        { status: 400 }
      )
    }

    await prisma.promptTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir template de prompt:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const PUT = withAdminAuth(handlePut)
export const DELETE = withAdminAuth(handleDelete)