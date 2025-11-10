import { withAdminAuthSimple } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

async function handler() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        chatMessages: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return Response.json(projects)
  } catch (error) {
    console.error("Erro ao buscar projetos com chat:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuthSimple(handler)