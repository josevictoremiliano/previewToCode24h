import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const projectSchema = z.object({
  userId: z.string(),
  projectId: z.string(),
  basicInfo: z.object({
    siteName: z.string().min(1, "Nome do site é obrigatório"),
    slogan: z.string().optional(),
    siteType: z.string().min(1, "Tipo do site é obrigatório"),
    niche: z.string().optional(),
  }),
  visualIdentity: z.object({
    logoUrl: z.string().optional(),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    style: z.string().optional(),
    referenceUrls: z.array(z.string()),
  }),
  content: z.object({
    description: z.string().optional(),
    targetAudience: z.string().optional(),
    products: z.array(z.string()),
    cta: z.string().optional(),
    sections: z.array(z.string()),
  }),
  contact: z.object({
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    address: z.string().optional(),
    socialMedia: z.object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      whatsapp: z.string().optional(),
    }),
  }),
  additionalResources: z.object({
    images: z.array(z.string()),
    customTexts: z.string().optional(),
    features: z.array(z.string()),
  }),
  timestamp: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Construir filtros
    const where: {
      userId: string
      name?: { contains: string; mode: 'insensitive' }
      status?: 'PENDING' | 'PREVIEW' | 'APPROVED' | 'COMPLETED' | 'PUBLISHED' | 'REVISION'
    } = {
      userId: session.user.id
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (status !== 'all') {
      where.status = status as 'PENDING' | 'PREVIEW' | 'APPROVED' | 'COMPLETED' | 'PUBLISHED' | 'REVISION'
    }

    // Buscar projetos do usuário
    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        previewUrl: true,
        publishUrl: true
      }
    })

    // Mapear para formato esperado pelo frontend
    const mappedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      status: project.status,
      createdAt: project.createdAt,
      previewUrl: project.previewUrl,
      finalUrl: project.publishUrl,
      thumbnailUrl: "/api/placeholder/400/300"
    }))

    return NextResponse.json(mappedProjects)

  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validação dos dados
    const data = projectSchema.parse(body)

    // Verificar se o usuário corresponde
    if (data.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      )
    }

    // Criar projeto no banco de dados
    const project = await prisma.project.create({
      data: {
        userId: data.userId,
        status: "PENDING",
        name: data.basicInfo.siteName,
        data: data, // Salva todos os dados do projeto no campo JSON
      },
    })

    // Criar notificação para o usuário
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        type: "PROJECT_CREATED",
        title: "Landing page criada com sucesso!",
        message: `Seu site "${data.basicInfo.siteName}" foi criado e está sendo processado. Você receberá um preview em até 12 horas.`,
      },
    })

    // Processar projeto com IA integrada
    try {
      // Importar função de processamento (dynamic import para evitar problemas de build)
      const { processProjectWithAI } = await import('@/lib/ai-processor')
      
      // Processar em background para não bloquear a resposta
      processProjectWithAI(data, project.id).catch(error => {
        console.error('Erro no processamento em background:', error)
        // Erro já é tratado dentro da função processProjectWithAI
      })
      
    } catch (processingError) {
      console.error("Erro ao iniciar processamento:", processingError)
      // Não falhar a requisição se o processamento falhar ao iniciar
      
      // Notificar que o processamento será manual
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          projectId: project.id,
          type: "PROJECT_MANUAL",
          title: "Processamento será manual",
          message: `O site "${data.basicInfo.siteName}" será processado manualmente pela nossa equipe.`,
        }
      })
    }

    return NextResponse.json(
      { 
        project: {
          id: project.id,
          siteName: project.name,
          status: project.status,
          createdAt: project.createdAt,
        },
        message: "Projeto criado com sucesso!" 
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Erro ao criar projeto:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}