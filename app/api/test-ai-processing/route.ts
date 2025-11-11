import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { processProjectWithAI } from "@/lib/ai-processor"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return Response.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // Verificar se é admin (para teste)
    if (session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Acesso negado. Apenas administradores podem testar." },
        { status: 403 }
      )
    }

    const testData = await request.json()
    
    console.log("Iniciando teste de processamento de IA...")
    
    // Usar um ID de projeto fake para teste
    const testProjectId = "test-project-" + Date.now()
    
    const result = await processProjectWithAI(testData, testProjectId)
    
    return Response.json({
      success: true,
      message: "Teste executado com sucesso",
      result,
      projectId: testProjectId
    })
    
  } catch (error) {
    console.error("Erro no teste de IA:", error)
    return Response.json(
      { 
        error: "Erro no processamento",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    )
  }
}