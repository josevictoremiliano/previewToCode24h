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
      siteName?: { contains: string; mode: 'insensitive' }
      status?: 'PENDING' | 'PREVIEW' | 'APPROVED' | 'COMPLETED' | 'PUBLISHED' | 'REVISION'
    } = {
      userId: session.user.id
    }

    if (search) {
      where.siteName = {
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
        siteName: true,
        status: true,
        createdAt: true,
        previewUrl: true,
        finalUrl: true
      }
    })

    // Mapear para formato esperado pelo frontend
    const mappedProjects = projects.map(project => ({
      id: project.id,
      name: project.siteName,
      status: project.status,
      createdAt: project.createdAt,
      previewUrl: project.previewUrl,
      finalUrl: project.finalUrl,
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
        siteName: data.basicInfo.siteName,
        slogan: data.basicInfo.slogan,
        siteType: data.basicInfo.siteType,
        niche: data.basicInfo.niche,
        logoUrl: data.visualIdentity.logoUrl,
        primaryColor: data.visualIdentity.primaryColor,
        secondaryColor: data.visualIdentity.secondaryColor,
        style: data.visualIdentity.style,
        referenceUrls: data.visualIdentity.referenceUrls,
        description: data.content.description,
        targetAudience: data.content.targetAudience,
        products: data.content.products,
        cta: data.content.cta,
        sections: data.content.sections,
        contactEmail: data.contact.email,
        contactPhone: data.contact.phone,
        contactAddress: data.contact.address,
        socialMedia: data.contact.socialMedia,
        images: data.additionalResources.images,
        customTexts: data.additionalResources.customTexts,
        features: data.additionalResources.features,
      },
    })

    // Criar notificação para o usuário
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        type: "PROJECT_CREATED",
        title: "Site criado com sucesso!",
        message: `Seu site "${data.basicInfo.siteName}" foi criado e está sendo processado. Você receberá um preview em até 12 horas.`,
      },
    })

    // Enviar para webhook n8n
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL
      if (webhookUrl) {
        const webhookPayload = {
          ...data,
          projectId: project.id, // Usar o ID real do projeto
          userInfo: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
          },
        }

        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookPayload),
        })

        if (!webhookResponse.ok) {
          console.error("Erro no webhook n8n:", await webhookResponse.text())
          // Não falhar a requisição se o webhook falhar
        }
      }
    } catch (webhookError) {
      console.error("Erro ao enviar para webhook:", webhookError)
      // Não falhar a requisição se o webhook falhar
    }

    return NextResponse.json(
      { 
        project: {
          id: project.id,
          siteName: project.siteName,
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