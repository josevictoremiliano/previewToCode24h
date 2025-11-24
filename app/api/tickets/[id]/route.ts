import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const ticket = await prisma.ticket.findUnique({
            where: {
                id,
                userId: session.user.id,
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
