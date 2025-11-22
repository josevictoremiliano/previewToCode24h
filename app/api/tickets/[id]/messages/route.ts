import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const messages = await prisma.ticketMessage.findMany({
            where: {
                ticketId: id,
            },
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
                createdAt: "asc",
            },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error("[TICKET_MESSAGES_GET] Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const json = await req.json()
        const { content, attachments } = json

        if (!content && (!attachments || attachments.length === 0)) {
            return new NextResponse("Content or attachments required", { status: 400 })
        }

        const message = await prisma.ticketMessage.create({
            data: {
                content: content || "",
                ticketId: id,
                userId: session.user.id,
                attachments: {
                    create: attachments?.map((attachment: any) => ({
                        url: attachment.url,
                        filename: attachment.filename,
                        type: attachment.type,
                    })),
                },
            },
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
        })

        return NextResponse.json(message)
    } catch (error) {
        console.error("[TICKET_MESSAGES_POST] Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
