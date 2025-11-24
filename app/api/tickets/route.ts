import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateTicketProtocol } from "@/lib/generate-ticket-protocol"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const data = await req.json()
        const { subject, description, priority } = data

        if (!subject || !description) {
            return new NextResponse("Subject and description are required", { status: 400 })
        }

        // Gerar protocolo único
        const protocol = await generateTicketProtocol()

        const ticket = await prisma.ticket.create({
            data: {
                protocol,
                subject,
                description,
                priority: priority || "MEDIUM",
                userId: session.user.id,
            },
        })

        return NextResponse.json(ticket)
    } catch (error) {
        console.error("Error creating ticket:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const tickets = await prisma.ticket.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(tickets)
    } catch (error) {
        console.error("Error fetching tickets:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
