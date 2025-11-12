import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Buscar projeto com campos necessários
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        htmlContent: true,
        data: true
      }
    })

    if (!project) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head><title>Preview não encontrado</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>Preview não encontrado</h1>
          <p>O projeto solicitado não existe ou não possui preview disponível.</p>
        </body>
        </html>`,
        { 
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Priorizar htmlContent (novo sistema), depois dados antigos
    let generatedHtml = project.htmlContent
    
    if (!generatedHtml) {
      const projectData = project.data as Record<string, unknown>
      generatedHtml = projectData?.generatedContent?.html || 
                     projectData?.generatedHtml || 
                     projectData?.htmlContent
    }

    if (!generatedHtml) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head><title>Preview em desenvolvimento</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>Preview em desenvolvimento</h1>
          <p>O HTML do projeto "${project.name}" ainda não foi gerado.</p>
          <p>Status: ${project.status}</p>
          <script>
            // Auto-refresh a cada 10 segundos se estiver processando
            if (['PROCESSING', 'COPY_READY', 'COPY_REVISION'].includes('${project.status}')) {
              setTimeout(() => window.location.reload(), 10000);
            }
          </script>
        </body>
        </html>`,
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