import { withAdminAuthSimple } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

async function handler() {
  try {
    // Buscar estatísticas gerais
    const [
      totalUsers,
      totalProjects,
      pendingProjects,
      completedProjects,
      cancelledProjects
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PENDING' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.count({ where: { status: 'CANCELLED' } })
    ])

    // Buscar projetos recentes
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Buscar usuários recentes
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    const stats = {
      totalUsers,
      totalProjects,
      pendingProjects,
      completedProjects,
      cancelledProjects
    }

    return Response.json({
      stats,
      recentProjects,
      recentUsers
    })

  } catch (error) {
    console.error("Erro no dashboard admin:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuthSimple(handler)