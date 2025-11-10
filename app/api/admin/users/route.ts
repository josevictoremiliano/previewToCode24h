import { withAdminAuthSimple } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

async function handler(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    
    // Construir filtros
    const where: {
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' } | { email?: { contains: string; mode: 'insensitive' } } }>
      role?: string
    } = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role !== 'all') {
      where.role = role
    }

    // Buscar usuários
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    return Response.json(users)

  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const GET = withAdminAuthSimple(handler)