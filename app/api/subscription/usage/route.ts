import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar dados de uso do usuário
    const currentMonth = new Date()
    currentMonth.setDate(1)  // Primeiro dia do mês
    currentMonth.setHours(0, 0, 0, 0)

    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Contar sites criados este mês
    const sitesThisMonth = await prisma.project.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: currentMonth,
          lt: nextMonth,
        },
      },
    })

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        createdAt: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    })

    // Simular dados de armazenamento (em uma implementação real, você calcularia isso baseado nos arquivos dos sites)
    const storageUsed = Math.min(sitesThisMonth * 150 + Math.random() * 200, 1024) // Simular até 1GB
    
    const usageData = {
      sitesUsed: sitesThisMonth,
      sitesLimit: 1, // Plano gratuito
      storageUsed: Math.round(storageUsed),
      storageLimit: 1024, // 1GB
      totalSites: user?._count.projects || 0,
      memberSince: user?.createdAt || new Date(),
      currentPlan: "free",
    }

    return NextResponse.json(usageData)
  } catch (error) {
    console.error("Erro ao buscar dados de uso:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}