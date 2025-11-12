import { NextRequest, NextResponse } from "next/server"
import { uploadImage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { images, projectId } = await request.json()

    if (!images || !Array.isArray(images) || !projectId) {
      return NextResponse.json(
        { error: "images (array) e projectId são obrigatórios" },
        { status: 400 }
      )
    }

    console.log(`🚀 Processando ${images.length} imagens para projeto ${projectId}...`)

    const uploadPromises = images.map(async (imageData, index) => {
      try {
        // Validar formato da imagem
        if (!imageData.startsWith('data:image/')) {
          throw new Error(`Imagem ${index + 1}: Formato inválido`)
        }

        // Upload para MinIO
        const result = await uploadImage(imageData, projectId, `image-${index + 1}`)
        
        console.log(`✅ Imagem ${index + 1} uploaded:`, result.url)
        
        return {
          originalIndex: index,
          url: result.url,
          key: result.key,
          size: result.size,
          success: true
        }
      } catch (error) {
        console.error(`❌ Erro no upload da imagem ${index + 1}:`, error)
        return {
          originalIndex: index,
          error: error instanceof Error ? error.message : "Erro desconhecido",
          success: false
        }
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(`✅ Upload concluído: ${successful.length} sucessos, ${failed.length} falhas`)

    return NextResponse.json({
      message: `Upload concluído: ${successful.length}/${images.length} imagens enviadas`,
      results,
      successful: successful.map(r => ({ index: r.originalIndex, url: r.url })),
      failed: failed.map(r => ({ index: r.originalIndex, error: r.error }))
    })

  } catch (error) {
    console.error("❌ Erro no upload múltiplo:", error)
    
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}