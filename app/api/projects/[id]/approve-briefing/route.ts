import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado - apenas administradores' }, { status: 403 });
    }

    const { id } = params;
    
    // Buscar o projeto
    const project = await prisma.project.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    if (project.status !== 'PENDING') {
      return NextResponse.json({ error: 'Projeto não está pendente de aprovação' }, { status: 400 });
    }

    // Atualizar status para PROCESSING e atribuir admin
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        assignedAdminId: user.id,
        updatedAt: new Date()
      }
    });

    // Criar notificação para o usuário
    await prisma.notification.create({
      data: {
        userId: project.userId,
        projectId: id,
        type: 'BRIEFING_APPROVED',
        title: 'Briefing Aprovado!',
        message: `Seu projeto "${project.name}" foi aprovado e nossa IA está gerando o site. Você receberá uma notificação quando o preview estiver pronto.`,
        read: false
      }
    });

    // Disparar geração automática do HTML pela IA
    // Chamar a API de geração em background
    try {
      const generateResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/projects/${id}/generate-html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}` // Para identificar o admin que aprovou
        }
      });

      if (!generateResponse.ok) {
        console.error('Erro ao disparar geração HTML:', await generateResponse.text());
        // Não falha a aprovação se a geração falhar - pode ser reprocessada
      }
    } catch (error) {
      console.error('Erro ao disparar geração HTML:', error);
      // Não falha a aprovação se a geração falhar
    }

    return NextResponse.json({ 
      message: 'Briefing aprovado com sucesso',
      project: updatedProject
    });

  } catch (error) {
    console.error('Erro ao aprovar briefing:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}