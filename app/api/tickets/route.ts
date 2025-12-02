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
        const { subject, description, priority, attachments } = data

        if (!subject || !description) {
            return new NextResponse("Subject and description are required", { status: 400 })
        }

        // Gerar protocolo único
        const protocol = await generateTicketProtocol()

        // Criar ticket e a primeira mensagem com anexos (se houver)
        const ticket = await prisma.ticket.create({
            data: {
                protocol,
                subject,
                description,
                priority: priority || "MEDIUM",
                userId: session.user.id,
                messages: {
                    create: {
                        content: description,
                        userId: session.user.id,
                        attachments: attachments && attachments.length > 0 ? {
                            create: attachments.map((att: any) => ({
                                url: att.url,
                                filename: att.filename,
                                type: att.type
                            }))
                        } : undefined
                    }
                }
            },
            include: {
                messages: {
                    include: {
                        attachments: true
                    }
                }
            }
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
