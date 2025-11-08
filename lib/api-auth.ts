import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function authenticateApiKey(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!apiKey) {
      return null
    }

    // Buscar a API key no banco (comparando com hash)
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        user: true
      }
    })

    // Verificar se alguma das chaves bate
    for (const keyRecord of apiKeys) {
      const isValid = await bcrypt.compare(apiKey, keyRecord.key)
      if (isValid) {
        // Atualizar último uso
        await prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: { lastUsedAt: new Date() }
        })

        return {
          user: keyRecord.user,
          apiKey: keyRecord,
          permissions: keyRecord.permissions as any
        }
      }
    }

    return null
  } catch (error) {
    console.error("Erro na autenticação por API Key:", error)
    return null
  }
}

export function createUnauthorizedResponse(message: string = "API Key inválida ou ausente") {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}