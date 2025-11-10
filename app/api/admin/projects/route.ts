import { NextRequest } from "next/server"
import { withAdminAuthSimple } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

async function handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: Prisma.ProjectWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json(projects)
  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuthSimple(handler)