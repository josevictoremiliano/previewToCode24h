import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import systemConfigService from '@/lib/system-config'

export async function GET() {
  try {
    console.log('🔍 API GET: Iniciando busca de configurações...')
    const session = await getServerSession(authOptions)
    
    console.log('👤 Sessão:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    })
    
    // Verificar se é admin
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // TODO: Verificar se user.role === 'ADMIN'
    
    console.log('📦 Buscando configurações...')
    const configs = await systemConfigService.getAllSystemConfigs()
    console.log(`✅ Retornando ${configs.length} configurações`)

    return NextResponse.json({ configs })

  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 API: Recebendo requisição POST...')
    const session = await getServerSession(authOptions)
    
    console.log('👤 Sessão obtida:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role
    })
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // TODO: Verificar se user.role === 'ADMIN'

    const body = await request.json()
    const { key, value, encrypted, category, description } = body
    
    console.log('📝 Dados recebidos:', { key, value: value ? '[VALOR]' : null, encrypted, category, description })

    if (!key) {
      return NextResponse.json(
        { error: 'Chave da configuração é obrigatória' },
        { status: 400 }
      )
    }

    console.log('💾 Salvando configuração...')
    await systemConfigService.setSystemConfig(key, value, {
      encrypted: encrypted || false,
      category: category || 'general',
      description,
      userId: session.user.id
    })

    console.log('✅ Configuração salva com sucesso!')
    return NextResponse.json({ 
      message: 'Configuração salva com sucesso',
      key 
    })

  } catch (error) {
    console.error('❌ Erro ao salvar configuração:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // TODO: Verificar se user.role === 'ADMIN'

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Chave da configuração é obrigatória' },
        { status: 400 }
      )
    }

    await systemConfigService.deleteSystemConfig(key)

    return NextResponse.json({ 
      message: 'Configuração removida com sucesso',
      key 
    })

  } catch (error) {
    console.error('❌ Erro ao remover configuração:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}