import { NextRequest, NextResponse } from "next/server"
import { uploadImage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { imageData, projectId, imageName } = await request.json()

    if (!imageData || !projectId) {
      return NextResponse.json(
        { error: "imageData e projectId são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar formato da imagem
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json(
        { error: "Formato de imagem inválido" },
        { status: 400 }
      )
    }

    console.log(`🚀 Iniciando upload de imagem para projeto ${projectId}...`)

    // Upload para MinIO
    const result = await uploadImage(imageData, projectId, imageName)

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