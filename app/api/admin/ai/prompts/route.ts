import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function handleGet(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    
    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }

    const templates = await prisma.promptTemplate.findMany({
      where,
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

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erro ao buscar templates de prompt:', error)
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
    const { name, key, prompt, description, category, variables, isActive } = body

    // Validações
    if (!name || !key || !prompt) {
      return NextResponse.json(
        { error: 'Nome, chave e prompt são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a chave já existe
    const existingTemplate = await prisma.promptTemplate.findUnique({
      where: { key }
    })

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Chave já existe. Use uma chave única.' },
        { status: 400 }
      )
    }

    const template = await prisma.promptTemplate.create({
      data: {
        name,
        key,
        prompt,
        description,
        category: category || 'general',
        variables: variables || [],
        isActive: isActive !== false,
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

    return NextResponse.json(template)
  } catch (error) {
    console.error('Erro ao criar template de prompt:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuth(handleGet)
export const POST = withAdminAuth(handlePost)