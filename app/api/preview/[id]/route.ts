import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return new NextResponse(
        '<html><body><h1>Projeto não encontrado</h1></body></html>',
        { 
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Extrair HTML gerado
    const projectData = project.data as any
    const generatedHtml = projectData?.generatedContent?.html || 
                         projectData?.generatedHtml || 
                         projectData?.htmlContent

    if (!generatedHtml) {
      return new NextResponse(
        `<html><body>
          <div style="padding: 2rem; text-align: center; font-family: system-ui;">
            <h1>Preview não disponível</h1>
            <p>O site ainda está sendo processado ou não foi gerado.</p>
            <p>Status: ${project.status}</p>
            <script>
              // Auto-refresh a cada 5 segundos se estiver processando
              if ('${project.status}' === 'PROCESSING') {
                setTimeout(() => window.location.reload(), 5000);
              }
            </script>
          </div>
        </body></html>`,
        { 
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    return new NextResponse(generatedHtml, {
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('Erro ao servir preview:', error)
    return new NextResponse(
      '<html><body><h1>Erro interno do servidor</h1></body></html>',
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}