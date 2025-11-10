import { withAdminAuthSimple } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

async function handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const range = searchParams.get('range') || '30d'
    
    // Calcular data de início baseada no range
    const now = new Date()
    const startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Buscar estatísticas básicas
    const [
      totalUsers,
      totalProjects
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count()
    ])

    // Projetos por status
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const statusCounts = projectsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // Top usuários por número de projetos
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: {
        projects: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Crescimento mensal (últimos 6 meses)
    const monthlyGrowth = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      
      const [userCount, projectCount] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lt: monthEnd
            }
          }
        }),
        prisma.project.count({
          where: {
            createdAt: {
              gte: monthStart,
              lt: monthEnd
            }
          }
        })
      ])
      
      monthlyGrowth.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        users: userCount,
        projects: projectCount
      })
    }

    // Formatar top users
    const formattedTopUsers = topUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      projectCount: user._count.projects
    }))

    const reportData = {
      summary: {
        totalUsers,
        totalProjects,
        projectsByStatus: statusCounts,
        userGrowth: monthlyGrowth
      },
      topUsers: formattedTopUsers
    }

    return Response.json(reportData)

  } catch (error) {
    console.error("Erro ao gerar relatório:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuthSimple(handler)