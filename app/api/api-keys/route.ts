import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// Listar API Keys do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        active: true,
        lastUsedAt: true,
        expiresAt: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Erro ao buscar API Keys:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Criar nova API Key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { name, permissions, expiresAt } = await request.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Nome da API Key é obrigatório" },
        { status: 400 }
      )
    }

    // Gerar chave aleatória
    const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`
    const hashedKey = await bcrypt.hash(rawKey, 12)
    
    // Criar preview da chave (primeiros 8 e últimos 4 caracteres)
    const keyPreview = `${rawKey.substring(0, 12)}...${rawKey.slice(-4)}`

    const apiKey = await prisma.apiKey.create({
      data: {
        name: name.trim(),
        key: hashedKey,
        keyPreview,
        userId: session.user.id,
        permissions: permissions || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        active: true,
        expiresAt: true,
        permissions: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      ...apiKey,
      key: rawKey // Retorna a chave apenas uma vez
    })
  } catch (error) {
    console.error("Erro ao criar API Key:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Atualizar API Key (ativar/desativar, alterar nome)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id, name, active } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "ID da API Key é obrigatório" },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (active !== undefined) updateData.active = active

    const apiKey = await prisma.apiKey.updateMany({
      where: {
        id,
        userId: session.user.id, // Garantir que o usuário só pode editar suas próprias keys
      },
      data: updateData,
    })

    if (apiKey.count === 0) {
      return NextResponse.json(
        { error: "API Key não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar API Key:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// Deletar API Key
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID da API Key é obrigatório" },
        { status: 400 }
      )
    }

    const deletedKey = await prisma.apiKey.deleteMany({
      where: {
        id,
        userId: session.user.id, // Garantir que o usuário só pode deletar suas próprias keys
      },
    })

    if (deletedKey.count === 0) {
      return NextResponse.json(
        { error: "API Key não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar API Key:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}