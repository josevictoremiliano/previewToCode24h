import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔍 Testando autenticação...')
    
    const session = await getServerSession(authOptions)
    
    console.log('👤 Sessão completa:', JSON.stringify(session, null, 2))
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'Nenhuma sessão encontrada'
      })
    }
    
    if (!session.user?.id) {
      return NextResponse.json({
        authenticated: false,
        session: session,
        message: 'Sessão sem user.id'
      })
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      },
      message: 'Autenticado com sucesso'
    })
    
  } catch (error) {
    console.error('❌ Erro no teste de auth:', error)
    return NextResponse.json({
      authenticated: false,
      error: error.message
    }, { status: 500 })
  }
}