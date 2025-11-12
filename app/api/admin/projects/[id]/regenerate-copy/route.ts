import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Verificar autenticação e autorização admin
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar projeto com briefing
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        briefing: true,
        assignedAdmin: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    console.log('🔄 API: Regenerando copy para projeto...')

    // Regenerar copy seguindo padrão de landing page moderna
    console.log('📝 Regenerando copy com IA seguindo padrão estruturado...')
    
    const mockCopy = `
# HERO_SECTION
## headline: Transforme seu negócio com ${project.briefing?.businessType || 'estratégias digitais'}
## subheadline: que realmente geram resultados comprovados!
## description: ${project.briefing?.description || 'Pare de desperdiçar tempo e dinheiro com estratégias que não funcionam. Nossa metodologia já transformou centenas de empresas e agora é a sua vez de alcançar o próximo nível.'}
## cta_text: QUERO TRANSFORMAR MEU NEGÓCIO
## hero_image: ${project.data?.additionalResources?.images?.[0] ? `[IMAGEM PERSONALIZADA: ${project.data.additionalResources.images[0]}]` : '[IMAGEM: Profissional confiante com resultados visíveis]'}

# SOCIAL_PROOF_SECTION  
## testimonial_quote: "Finalmente encontrei uma solução que funciona de verdade!"
## testimonial_author: ${project.briefing?.targetAudience || 'Cliente satisfeito'}
## testimonial_description: Assim como você, muitos empresários já tentaram diferentes abordagens sem sucesso. Descubra o que fez a diferença para quem já conseguiu os resultados desejados.

# PROBLEM_SECTION
## title: Seu ${project.briefing?.businessType || 'negócio'} merece mais:
## problems:
- Maior visibilidade no mercado
- Clientes mais qualificados e engajados
- Processos otimizados e eficientes  
- Crescimento sustentável e previsível

# SERVICES_SECTION
## title: Como Podemos Ajudar Você
## services_list: ${project.briefing?.mainServices || 'Consultoria especializada, Implementação de estratégias, Acompanhamento de resultados, Suporte contínuo'}
## service_1:
### title: Análise Completa
### description: Diagnóstico detalhado para identificar oportunidades de melhoria no seu negócio
### icon: [ÍCONE: Análise/Diagnóstico]

## service_2:  
### title: Estratégia Personalizada
### description: Plano de ação customizado baseado nas suas necessidades específicas
### icon: [ÍCONE: Estratégia/Planejamento]

## service_3:
### title: Implementação Guiada  
### description: Execução acompanhada com suporte especializado em cada etapa
### icon: [ÍCONE: Implementação/Suporte]

# ABOUT_SECTION
## title: Conheça ${project.briefing?.siteName || 'Nossa Equipe'}
## description: Com anos de experiência no mercado, nossa missão é transformar negócios através de soluções inovadoras e eficazes. Já ajudamos centenas de empresas a alcançarem seus objetivos e queremos fazer o mesmo por você.
## about_image: ${project.data?.additionalResources?.images?.[1] ? `[IMAGEM PERSONALIZADA: ${project.data.additionalResources.images[1]}]` : '[IMAGEM: Equipe profissional ou especialista principal]'}

# STRATEGY_SECTION
## title: Nossa metodologia é ideal para você que busca:
## checklist:
- Resultados mensuráveis e sustentáveis
- Processos eficientes e automatizados
- Crescimento organizado e escalável
- Diferenciação da concorrência
- Maior produtividade da equipe
- ROI positivo em suas ações

# TESTIMONIALS_SECTION  
## title: O Que Nossos Clientes Dizem
## testimonials:
### testimonial_1: "Superou todas as nossas expectativas"
### testimonial_2: "Profissionalismo e qualidade incomparáveis" 
### testimonial_3: "Investimento que realmente vale a pena"
### testimonial_4: "Resultados visíveis desde o primeiro mês"
### testimonial_5: "Recomendo para qualquer empresário sério"

# CREDIBILITY_SECTION
## title: Acreditamos no potencial do seu ${project.briefing?.businessType || 'negócio'}
## description: ${project.briefing?.description || 'Nossa experiência comprova que todo negócio tem potencial para crescer quando aplicadas as estratégias certas. Deixe-nos mostrar como você pode alcançar resultados extraordinários.'}
## credibility_image: ${project.data?.additionalResources?.images?.[2] ? `[IMAGEM PERSONALIZADA: ${project.data.additionalResources.images[2]}]` : '[IMAGEM: Ambiente profissional inspirador]'}

# CTA_SECTION
## title: Pronto para dar o próximo passo?
## description: Agende uma conversa gratuita e descubra como podemos transformar os resultados do seu negócio.
## cta_text: QUERO COMEÇAR AGORA
## form_fields: Nome Completo, E-mail, Telefone, Empresa

# FAQ_SECTION
## title: Dúvidas Frequentes
## faqs:
### faq_1: Como funciona o processo de trabalho?
### faq_2: Quais garantias vocês oferecem?
### faq_3: Em quanto tempo vejo resultados?
### faq_4: O investimento vale a pena para meu porte de empresa?
### faq_5: Como é feito o acompanhamento?

# CONTACT_INFO
## email: ${project.briefing?.contactInfo || 'contato@empresa.com'}
## phone: ${project.briefing?.contactInfo || '(11) 99999-9999'}  
## website: www.empresa.com.br
## social_media: LinkedIn, Instagram, WhatsApp
    `

    // Atualizar projeto com a copy regerada
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        copy: mockCopy.trim(),
        status: 'COPY_READY',
        updatedAt: new Date()
      },
      include: {
        user: true,
        briefing: true,
        assignedAdmin: true
      }
    })

    // Criar log da ação
    await prisma.projectLog.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        action: 'COPY_REGENERATED',
        description: `Copy regenerada automaticamente pela IA por ${session.user.email}`,
        metadata: {
          timestamp: new Date().toLocaleString('pt-BR'),
          method: 'AI_REGENERATION',
          admin: session.user.email
        }
      }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        type: 'COPY_REGENERATED',
        title: 'Copy Regenerada',
        message: `Copy foi regenerada automaticamente para o projeto "${project.name}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ Copy regenerada com sucesso')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao regenerar copy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}