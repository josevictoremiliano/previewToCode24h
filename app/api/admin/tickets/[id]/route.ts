import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Verificar se o usuário é admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (user?.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                messages: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        attachments: true,
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
            },
        })

        if (!ticket) {
            return new NextResponse("Ticket not found", { status: 404 })
        }

        return NextResponse.json(ticket)
    } catch (error) {
        console.error("Error fetching ticket:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Verificar se o usuário é admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (user?.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const data = await req.json()
        const { status } = data

        if (!["OPEN", "IN_PROGRESS", "CLOSED"].includes(status)) {
            return new NextResponse("Invalid status", { status: 400 })
        }

        const ticket = await prisma.ticket.update({
            where: { id },
            data: { status },
            include: {
                user: true
            }
        })

        // Criar notificação para o usuário
        await prisma.notification.create({
            data: {
                title: "Status do ticket atualizado",
                message: `Seu ticket #${ticket.protocol} foi atualizado para: ${status === 'OPEN' ? 'Aberto' : status === 'IN_PROGRESS' ? 'Em Andamento' : 'Fechado'}`,
                type: "INFO",
                userId: ticket.userId,
            },
        })

        return NextResponse.json(ticket)
    } catch (error) {
        console.error("Error updating ticket:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
