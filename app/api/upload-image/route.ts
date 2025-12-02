import { NextRequest, NextResponse } from "next/server"
import { uploadImage } from "@/lib/storage"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { imageData, projectId, imageName } = await request.json()

    if (!imageData || !projectId) {
      return NextResponse.json(
        { error: "imageData e projectId são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar permissão (Dono do projeto ou Admin)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, name: true, createdAt: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 }
      )
    }

    const isOwner = project.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Você não tem permissão para fazer upload neste projeto" },
        { status: 403 }
      )
    }

    // Validar formato da imagem
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json(
        { error: "Formato de imagem inválido" },
        { status: 400 }
      )
    }

    // Validar tamanho (max 5MB)
    // Cálculo aproximado para base64: (tamanho em chars * 3/4) - padding
    const base64Length = imageData.length - (imageData.indexOf(',') + 1);
    const padding = (imageData.charAt(imageData.length - 1) === '=') ? (imageData.charAt(imageData.length - 2) === '=' ? 2 : 1) : 0;
    const fileSizeInBytes = (base64Length * 0.75) - padding;

    if (fileSizeInBytes > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem muito grande. O tamanho máximo permitido é 5MB." },
        { status: 400 }
      )
    }

    console.log(`🚀 Iniciando upload de imagem para projeto ${projectId}...`)

    // Upload para MinIO
    const result = await uploadImage(imageData, projectId, imageName, project)

    console.log(`✅ Imagem uploaded com sucesso:`, result.url)

    return NextResponse.json({
      message: "Upload realizado com sucesso",
      url: result.url,
      key: result.key,
      size: result.size
    })

  } catch (error) {
    console.error("❌ Erro no upload da imagem:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}