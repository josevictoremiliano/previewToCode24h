import { NextRequest, NextResponse } from 'next/server';
import { processProjectImages } from '@/lib/storage';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Buscar o projeto
    const project = await prisma.project.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    console.log('🚀 Iniciando processamento de imagens para projeto:', project.name);

    // Processar e fazer upload das imagens
    const updatedData = await processProjectImages(project.data);

    // Atualizar o projeto no banco com as novas URLs
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        data: updatedData,
        updatedAt: new Date()
      }
    });

    console.log('✅ Imagens processadas e projeto atualizado');

    return NextResponse.json({
      message: 'Imagens processadas com sucesso',
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        status: updatedProject.status
      }
    });

  } catch (error) {
    console.error('❌ Erro ao processar imagens:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}