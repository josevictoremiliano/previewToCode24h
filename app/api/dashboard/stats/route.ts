import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar estatísticas do usuário
    const [totalSites, sitesInProduction, sitesPending, sitesCompleted] = await Promise.all([
      // Total de sites
      prisma.project.count({
        where: { userId: user.id }
      }),
      
      // Sites em produção (em desenvolvimento/preview/aprovado)
      prisma.project.count({
        where: { 
          userId: user.id,
          status: {
            in: ['PENDING', 'PREVIEW', 'APPROVED', 'REVISION']
          }
        }
      }),
      
      // Sites pendentes (status PENDING)
      prisma.project.count({
        where: { 
          userId: user.id,
          status: 'PENDING'
        }
      }),
      
      // Sites finalizados (status COMPLETED)
      prisma.project.count({
        where: { 
          userId: user.id,
          status: 'COMPLETED'
        }
      })
    ])

    // Calcular créditos disponíveis (exemplo: plano básico = 3 sites por mês)
    const creditsAvailable = Math.max(0, 3 - totalSites)

    return NextResponse.json({
      totalSites,
      sitesInProduction,
      sitesPending,
      sitesCompleted,
      creditsAvailable
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}