import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const read = searchParams.get("read")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    const whereClause: { userId: string; read?: boolean } = {
      userId: session.user.id,
    }
    
    if (read !== null) {
      whereClause.read = read === "true"
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            siteName: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { notificationId, read, markAllAsRead } = await request.json()

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      })
      
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
        data: {
          read: read !== undefined ? read : true,
        },
      })
      
      return NextResponse.json({ success: true, updated: notification.count })
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")
    const clearRead = searchParams.get("clearRead") === "true"

    if (clearRead) {
      const deleted = await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          read: true,
        },
      })
      
      return NextResponse.json({ success: true, deleted: deleted.count })
    }

    if (notificationId) {
      const deleted = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
      })
      
      return NextResponse.json({ success: true, deleted: deleted.count })
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao deletar notificação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}