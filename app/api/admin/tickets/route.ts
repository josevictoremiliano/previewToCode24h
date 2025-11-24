import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
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

        const tickets = await prisma.ticket.findMany({
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
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    include: {
                        user: {
                            select: {
                                name: true,
                                image: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: [
                {
                    status: 'asc' // OPEN primeiro
                },
                {
                    updatedAt: 'desc'
                }
            ],
        })

        return NextResponse.json(tickets)
    } catch (error) {
        console.error("Error fetching admin tickets:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
