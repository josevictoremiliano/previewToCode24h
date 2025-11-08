import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"

// Endpoint para o n8n buscar dados de projetos
export async function GET(request: NextRequest) {
  try {
    // Autenticar via API Key
    const authResult = await authenticateApiKey(request)
    
    if (!authResult) {
      return NextResponse.json(
        { error: "API Key inválida ou ausente" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (projectId) {
      // Buscar projeto específico
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      if (!project) {
        return NextResponse.json(
          { error: "Projeto não encontrado" },
          { status: 404 }
        )
      }

      return NextResponse.json(project)
    }

    // Buscar múltiplos projetos com filtros
    const whereClause: { status?: any } = {}
    if (status) {
      whereClause.status = status
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100), // Máximo 100 projetos por request
    })

    return NextResponse.json({
      projects,
      total: projects.length,
    })

  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}