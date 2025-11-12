import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Buscar projeto específico do usuário
    const project = await prisma.project.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Site não encontrado' },
        { status: 404 }
      )
    }

    // Extrair dados do campo JSON e mapear para formato esperado
    const projectData = project.data as any || {}
    
    const mappedProject = {
      id: project.id,
      siteName: projectData.basicInfo?.siteName || projectData.siteName || project.name,
      name: project.name,
      slogan: projectData.basicInfo?.slogan || projectData.slogan,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      siteType: projectData.basicInfo?.siteType || projectData.siteType,
      niche: projectData.basicInfo?.niche || projectData.niche,
      primaryColor: projectData.visualIdentity?.primaryColor || projectData.primaryColor,
      secondaryColor: projectData.visualIdentity?.secondaryColor || projectData.secondaryColor,
      contactEmail: projectData.contact?.email || projectData.contactEmail,
      contactPhone: projectData.contact?.phone || projectData.contactPhone,
      description: projectData.content?.description || projectData.description,
      previewUrl: project.previewUrl,
      publishUrl: project.publishUrl,
      logoUrl: projectData.visualIdentity?.logoUrl || projectData.logoUrl,
      style: projectData.visualIdentity?.style || projectData.style,
      referenceUrls: projectData.visualIdentity?.referenceUrls || projectData.referenceUrls,
      targetAudience: projectData.content?.targetAudience || projectData.targetAudience,
      products: projectData.content?.products || projectData.products,
      cta: projectData.content?.cta || projectData.cta,
      sections: projectData.content?.sections || projectData.sections,
      contactAddress: projectData.contact?.address || projectData.contactAddress,
      socialMedia: projectData.contact?.socialMedia || projectData.socialMedia,
      images: projectData.additionalResources?.images || projectData.images || [],
      customTexts: projectData.additionalResources?.customTexts || projectData.customTexts,
      features: projectData.additionalResources?.features || projectData.features,
      // Incluir todos os dados originais para compatibilidade
      data: project.data
    }

    return NextResponse.json(mappedProject)

  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Verificar se o projeto existe e pertence ao usuário
    const existingProject = await prisma.project.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Site não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar o projeto
    const updatedProject = await prisma.project.update({
      where: {
        id: id
      },
      data: {
        name: body.siteName || body.name || existingProject.name,
        data: body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      project: updatedProject
    })

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}