import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🤖 API: Gerando copy para projeto...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = resolvedParams.id

    // Buscar projeto
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        briefing: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    // TODO: Verificar se é admin ou se o projeto pertence ao usuário

    console.log('📝 Gerando copy com IA seguindo padrão de landing page...')
    
    // Copy estruturada seguindo o padrão da imagem de referência
    const mockCopy = `
# HERO_SECTION
## headline: Aumente seu faturamento e conquiste mais clientes
## subheadline: com ${project.briefing?.businessType || 'tráfego'} que realmente funciona!
## description: ${project.briefing?.description || 'Chega de gastar dinheiro com marketing que não dá resultado. Nossa metodologia comprovada já ajudou centenas de empresas a triplicar seu faturamento em menos de 90 dias.'}
## cta_text: QUERO AUMENTAR MINHAS VENDAS
## hero_image: ${project.data?.additionalResources?.images?.[0] ? `[IMAGEM PERSONALIZADA: ${project.data.additionalResources.images[0]}]` : '[IMAGEM: Profissional confiante com resultados visíveis]'}

# SOCIAL_PROOF_SECTION  
## testimonial_quote: "Cansei de perder tempo e dinheiro com tráfego que não funciona!"
## testimonial_author: ${project.briefing?.targetAudience || 'Empresário do setor'}
## testimonial_description: Esta é a realidade de 9 em cada 10 empresários que já tentaram fazer marketing digital e não tiveram os resultados esperados. Se você também se identifica com esta situação, continue lendo.

# PROBLEM_SECTION
## title: Seu negócio está a um clique de ter:
## problems:
- Baixo retorno sobre investimento em marketing
- Dificuldade para atrair clientes qualificados  
- Falta de previsibilidade nas vendas
- Dependência excessiva de indicações

# SERVICES_SECTION
## title: Nossos Serviços
## services_list: ${project.briefing?.mainServices || 'Estratégias de marketing digital, Gestão de tráfego pago, Otimização de conversões, Automação de vendas'}
## service_1:
### title: Diagnóstico
### description: Análise completa do seu negócio para identificar oportunidades de crescimento
### icon: [ÍCONE: Lupa/Análise]

## service_2:  
### title: Estratégia
### description: Criação de estratégia personalizada baseada no seu público e objetivos
### icon: [ÍCONE: Estratégia/Planejamento]

## service_3:
### title: Execução  
### description: Implementação e otimização contínua das campanhas para máximo retorno
### icon: [ÍCONE: Engrenagem/Execução]

# ABOUT_SECTION
## title: Prazer, sou ${project.briefing?.siteName || 'Wagner César'}
## description: Nos últimos anos ajudei centenas de empresários a transformarem seus negócios através do marketing digital. Minha missão é fazer com que você também tenha acesso a metodologia que já gerou milhões em faturamento para meus clientes.
## about_image: ${project.data?.additionalResources?.images?.[1] ? `[IMAGEM PERSONALIZADA: ${project.data.additionalResources.images[1]}]` : '[IMAGEM: Equipe profissional ou especialista principal]'}

# STRATEGY_SECTION
## title: Minha estratégia de tráfego é a solução ideal para você que:
## checklist:
- Precisa de resultados rápidos e consistentes  
- Quer ter previsibilidade no seu faturamento
- Busca um método comprovado e eficiente
- Deseja ter mais tempo para focar no seu negócio
- Quer escalar sem depender apenas de indicações
- Precisa de suporte especializado constante

# TESTIMONIALS_SECTION  
## title: Resultados Reais de Clientes Reais
## testimonials:
### testimonial_1: "Aumentou meu faturamento em 300% nos primeiros 60 dias"
### testimonial_2: "Finalmente encontrei alguém que entende do meu negócio" 
### testimonial_3: "O melhor investimento que já fiz na minha empresa"
### testimonial_4: "Resultados que superaram todas as expectativas"
### testimonial_5: "Profissionalismo e resultados garantidos"

# CREDIBILITY_SECTION
## title: Se você acredita que seu marketing pode fazer mais, você está certo.
## description: ${project.briefing?.description || 'Através de estratégias comprovadas e metodologia testada, já transformei centenas de negócios. Agora é a sua vez de fazer parte desse seleto grupo de empresários que descobriram como vender mais através do marketing digital.'}
## credibility_image: ${project.data?.additionalResources?.images?.[2] ? `[IMAGEM PERSONALIZADA: ${project.data.additionalResources.images[2]}]` : '[IMAGEM: Ambiente profissional inspirador]'}

# CTA_SECTION
## title: Marque uma sessão estratégica gratuita agora!
## description: Na chamada vamos analisar o seu negócio e mostrar como você pode aumentar seu faturamento nos próximos 90 dias.
## cta_text: QUERO AGENDAR MINHA SESSÃO
## form_fields: Nome, E-mail, Telefone, Empresa

# FAQ_SECTION
## title: Perguntas Frequentes
## faqs:
### faq_1: Como garantir que o meu investimento terá retorno?
### faq_2: Quanto tempo leva para ver os primeiros resultados?
### faq_3: Qual a diferença do seu método?
### faq_4: Como funciona o acompanhamento das campanhas?
### faq_5: É só para empresas grandes?

# CONTACT_INFO
## email: ${project.briefing?.contactInfo || 'contato@empresa.com'}
## phone: ${project.briefing?.contactInfo || '(11) 99999-9999'}  
## address: São Paulo, Brasil
## social_media: Instagram, Facebook, LinkedIn
    `

    // Atualizar projeto com a copy gerada
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
        action: 'COPY_GENERATED',
        description: `Copy gerada automaticamente pela IA por ${session.user.email}`,
        metadata: {
          timestamp: new Date().toLocaleString('pt-BR'),
          method: 'AI_GENERATION',
          admin: session.user.email
        }
      }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        type: 'COPY_GENERATED',
        title: 'Copy Gerada',
        message: `Copy foi gerada automaticamente para o projeto "${project.name}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ Copy gerada com sucesso')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao gerar copy:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}