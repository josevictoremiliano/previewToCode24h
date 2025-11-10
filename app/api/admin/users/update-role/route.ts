import { withAdminAuthSimple } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

async function handler(req: NextRequest) {
  try {
    const { userId, role } = await req.json()

    if (!userId || !role) {
      return Response.json(
        { error: "userId e role são obrigatórios" },
        { status: 400 }
      )
    }

    if (!['USER', 'ADMIN'].includes(role)) {
      return Response.json(
        { error: "Role inválida" },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return Response.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar o role do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return Response.json({
      message: "Role atualizada com sucesso",
      user: updatedUser
    })

  } catch (error) {
    console.error("Erro ao atualizar role do usuário:", error)
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export const POST = withAdminAuthSimple(handler)