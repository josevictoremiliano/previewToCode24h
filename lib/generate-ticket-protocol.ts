import { prisma } from "./prisma"

/**
 * Gera um protocolo único para o ticket
 * Formato: AAAAMM00001 (ano + mês + sequência de 5 dígitos)
 * Exemplo: 20251100369
 */
export async function generateTicketProtocol(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `${year}${month}`

    // Buscar o último ticket criado neste mês
    const lastTicket = await prisma.ticket.findFirst({
        where: {
            protocol: {
                startsWith: prefix
            }
        },
        orderBy: {
            protocol: 'desc'
        }
    })

    let sequence = 1

    if (lastTicket && lastTicket.protocol) {
        // Extrair a sequência do último protocolo e incrementar
        const lastSequence = parseInt(lastTicket.protocol.slice(-5))
        sequence = lastSequence + 1
    }

    // Formatar sequência com 5 dígitos
    const sequenceStr = String(sequence).padStart(5, '0')

    return `${prefix}${sequenceStr}`
}
