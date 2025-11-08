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

    // Mapear para formato esperado pelo frontend
    const mappedProject = {
      id: project.id,
      siteName: project.siteName,
      slogan: project.slogan,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      siteType: project.siteType,
      niche: project.niche,
      primaryColor: project.primaryColor,
      secondaryColor: project.secondaryColor,
      contactEmail: project.contactEmail,
      contactPhone: project.contactPhone,
      description: project.description,
      previewUrl: project.previewUrl,
      finalUrl: project.finalUrl,
      logoUrl: project.logoUrl,
      style: project.style,
      referenceUrls: project.referenceUrls,
      targetAudience: project.targetAudience,
      products: project.products,
      cta: project.cta,
      sections: project.sections,
      contactAddress: project.contactAddress,
      socialMedia: project.socialMedia,
      images: project.images,
      customTexts: project.customTexts,
      features: project.features
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