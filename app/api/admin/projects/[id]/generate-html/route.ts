import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🏗️ API: Gerando HTML para projeto...')
    
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

    if (!project.copy) {
      return NextResponse.json({ error: 'Copy deve ser gerada primeiro' }, { status: 400 })
    }

    console.log('🤖 Gerando HTML baseado na copy estruturada...')
    
    // HTML gerado seguindo padrão moderno de landing page
    const mockHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.briefing?.siteName || project.name} | Landing Page Profissional</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            overflow-x: hidden;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* HERO SECTION */
        .hero {
            background: ${project.data?.visualIdentity?.primaryColor ? 
              `linear-gradient(135deg, ${project.data.visualIdentity.primaryColor} 0%, ${project.data.visualIdentity.secondaryColor || project.data.visualIdentity.primaryColor} 100%)` :
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            };
            color: white;
            padding: 120px 0;
            text-align: center;
            position: relative;
        }
        .hero-logo img {
            filter: brightness(0) invert(1);
        }
        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        .hero .subheadline {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            color: #f8f9fa;
        }
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2.5rem;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .hero-image {
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            margin: 2rem auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            text-align: center;
        }
        
        /* BUTTONS */
        .btn {
            display: inline-block;
            background: ${project.data?.visualIdentity?.secondaryColor || '#ff6b6b'};
            color: white;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .btn:hover {
            background: ${project.data?.visualIdentity?.primaryColor || '#ff5252'};
            transform: translateY(-2px);
        }
        
        /* SOCIAL PROOF */
        .social-proof {
            background: #f8f9fa;
            padding: 60px 0;
            text-align: center;
        }
        .testimonial-quote {
            font-size: 1.8rem;
            font-style: italic;
            color: #495057;
            margin-bottom: 1rem;
        }
        .testimonial-author {
            font-weight: 600;
            color: #6c757d;
        }
        
        /* SECTIONS */
        .section {
            padding: 80px 0;
        }
        
        /* PROBLEM SECTION */
        .problem-section {
            background: white;
            text-align: center;
        }
        .problem-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        .problem-item {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 10px;
            border-left: 4px solid ${project.data?.visualIdentity?.primaryColor || '#667eea'};
        }
        
        /* SERVICES */
        .services {
            background: #f8f9fa;
        }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        .service-card {
            background: white;
            padding: 2.5rem;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        .service-card:hover {
            transform: translateY(-5px);
        }
        .service-icon {
            width: 80px;
            height: 80px;
            background: ${project.data?.visualIdentity?.primaryColor || '#667eea'};
            border-radius: 50%;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.8rem;
        }
        
        /* ABOUT */
        .about {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        .about-image {
            width: 100%;
            height: 400px;
            background: #e9ecef;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        /* STRATEGY */
        .strategy {
            background: #667eea;
            color: white;
        }
        .checklist {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 3rem;
        }
        .check-item {
            display: flex;
            align-items: center;
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 8px;
        }
        .check-item::before {
            content: "✓";
            margin-right: 1rem;
            font-weight: bold;
            color: #28a745;
        }
        
        /* TESTIMONIALS */
        .testimonials {
            background: #f8f9fa;
        }
        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        .testimonial-card {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        /* CREDIBILITY */
        .credibility {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        .credibility-image {
            width: 100%;
            height: 300px;
            background: #e9ecef;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        /* CTA SECTION */
        .cta-section {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-align: center;
        }
        .form-container {
            max-width: 500px;
            margin: 3rem auto 0;
        }
        .form-field {
            width: 100%;
            padding: 15px;
            margin-bottom: 1rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
        }
        
        /* FAQ */
        .faq {
            background: white;
        }
        .faq-list {
            max-width: 800px;
            margin: 3rem auto 0;
        }
        .faq-item {
            background: #f8f9fa;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        /* FOOTER */
        .footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 40px 0;
        }
        .footer-logo img {
            filter: brightness(0) invert(1);
        }
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }
        
        h2 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-align: center;
        }
        h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero .subheadline { font-size: 1.4rem; }
            .about, .credibility { grid-template-columns: 1fr; }
            .container { padding: 0 15px; }
        }
    </style>
</head>
<body>
    <!-- HERO SECTION -->
    <section class="hero">
        <div class="container">
            ${project.data?.visualIdentity?.logoUrl ? 
              `<div class="hero-logo mb-6">
                <img src="${project.data.visualIdentity.logoUrl}" alt="Logo ${project.briefing?.siteName || 'da empresa'}" class="max-h-16 mx-auto" />
              </div>` : 
              ''
            }
            <h1>Transforme seu negócio com ${project.briefing?.businessType || 'estratégias digitais'}</h1>
            <p class="subheadline">que realmente geram resultados comprovados!</p>
            <p>${project.briefing?.description || 'Pare de desperdiçar tempo e dinheiro com estratégias que não funcionam. Nossa metodologia já transformou centenas de empresas e agora é a sua vez de alcançar o próximo nível.'}</p>
            <div class="hero-image">
              ${(() => {
                const images = project.data?.additionalResources?.images || []
                const heroImage = Array.isArray(images) ? images.find((img: { position?: string, url?: string }) => img.position === 'hero') : null
                return heroImage ? 
                  `<img src="${heroImage.url || heroImage}" alt="Imagem principal" class="w-full h-full object-cover rounded-full" />` :
                  '[IMAGEM: Profissional confiante com resultados visíveis]'
              })()}
            </div>
            <a href="#cta" class="btn">QUERO TRANSFORMAR MEU NEGÓCIO</a>
        </div>
    </section>

    <!-- SOCIAL PROOF -->
    <section class="social-proof">
        <div class="container">
            <div class="testimonial-quote">"Finalmente encontrei uma solução que funciona de verdade!"</div>
            <div class="testimonial-author">${project.briefing?.targetAudience || 'Cliente satisfeito'}</div>
            <p>Assim como você, muitos empresários já tentaram diferentes abordagens sem sucesso. Descubra o que fez a diferença para quem já conseguiu os resultados desejados.</p>
        </div>
    </section>

    <!-- PROBLEM SECTION -->
    <section class="section problem-section">
        <div class="container">
            <h2>Seu ${project.briefing?.businessType || 'negócio'} merece mais:</h2>
            <div class="problem-list">
                <div class="problem-item">Maior visibilidade no mercado</div>
                <div class="problem-item">Clientes mais qualificados e engajados</div>
                <div class="problem-item">Processos otimizados e eficientes</div>
                <div class="problem-item">Crescimento sustentável e previsível</div>
            </div>
        </div>
    </section>

    <!-- SERVICES SECTION -->
    <section class="section services">
        <div class="container">
            <h2>Como Podemos Ajudar Você</h2>
            <div class="services-grid">
                <div class="service-card">
                    <div class="service-icon">[ÍCONE: Análise]</div>
                    <h3>Análise Completa</h3>
                    <p>Diagnóstico detalhado para identificar oportunidades de melhoria no seu negócio</p>
                </div>
                <div class="service-card">
                    <div class="service-icon">[ÍCONE: Estratégia]</div>
                    <h3>Estratégia Personalizada</h3>
                    <p>Plano de ação customizado baseado nas suas necessidades específicas</p>
                </div>
                <div class="service-card">
                    <div class="service-icon">[ÍCONE: Implementação]</div>
                    <h3>Implementação Guiada</h3>
                    <p>Execução acompanhada com suporte especializado em cada etapa</p>
                </div>
            </div>
        </div>
    </section>

    <!-- ABOUT SECTION -->
    <section class="section">
        <div class="container">
            <div class="about">
                <div>
                    <h2>Conheça ${project.briefing?.siteName || 'Nossa Equipe'}</h2>
                    <p>Com anos de experiência no mercado, nossa missão é transformar negócios através de soluções inovadoras e eficazes. Já ajudamos centenas de empresas a alcançarem seus objetivos e queremos fazer o mesmo por você.</p>
                </div>
                <div class="about-image">
                  ${(() => {
                    const images = project.data?.additionalResources?.images || []
                    const aboutImage = Array.isArray(images) ? images.find((img: { position?: string, url?: string }) => img.position === 'about') : null
                    return aboutImage ? 
                      `<img src="${aboutImage.url || aboutImage}" alt="Sobre nós" class="w-full h-full object-cover rounded-lg" />` :
                      '[IMAGEM: Equipe profissional ou especialista principal]'
                  })()}
                </div>
            </div>
        </div>
    </section>

    <!-- STRATEGY SECTION -->
    <section class="section strategy">
        <div class="container">
            <h2>Nossa metodologia é ideal para você que busca:</h2>
            <div class="checklist">
                <div class="check-item">Resultados mensuráveis e sustentáveis</div>
                <div class="check-item">Processos eficientes e automatizados</div>
                <div class="check-item">Crescimento organizado e escalável</div>
                <div class="check-item">Diferenciação da concorrência</div>
                <div class="check-item">Maior produtividade da equipe</div>
                <div class="check-item">ROI positivo em suas ações</div>
            </div>
        </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="section testimonials">
        <div class="container">
            <h2>O Que Nossos Clientes Dizem</h2>
            <div class="testimonials-grid">
                <div class="testimonial-card">"Superou todas as nossas expectativas"</div>
                <div class="testimonial-card">"Profissionalismo e qualidade incomparáveis"</div>
                <div class="testimonial-card">"Investimento que realmente vale a pena"</div>
                <div class="testimonial-card">"Resultados visíveis desde o primeiro mês"</div>
                <div class="testimonial-card">"Recomendo para qualquer empresário sério"</div>
            </div>
        </div>
    </section>

    <!-- CREDIBILITY -->
    <section class="section">
        <div class="container">
            <div class="credibility">
                <div class="credibility-image">
                  ${(() => {
                    const images = project.data?.additionalResources?.images || []
                    const credibilityImage = Array.isArray(images) ? images.find((img: { position?: string, url?: string }) => img.position === 'credibility') : null
                    return credibilityImage ? 
                      `<img src="${credibilityImage.url || credibilityImage}" alt="Credibilidade" class="w-full h-full object-cover rounded-lg" />` :
                      '[IMAGEM: Ambiente profissional inspirador]'
                  })()}
                </div>
                <div>
                    <h2>Acreditamos no potencial do seu ${project.briefing?.businessType || 'negócio'}</h2>
                    <p>${project.briefing?.description || 'Nossa experiência comprova que todo negócio tem potencial para crescer quando aplicadas as estratégias certas. Deixe-nos mostrar como você pode alcançar resultados extraordinários.'}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA SECTION -->
    <section class="section cta-section" id="cta">
        <div class="container">
            <h2>Pronto para dar o próximo passo?</h2>
            <p>Agende uma conversa gratuita e descubra como podemos transformar os resultados do seu negócio.</p>
            <div class="form-container">
                <input type="text" class="form-field" placeholder="Nome Completo">
                <input type="email" class="form-field" placeholder="E-mail">
                <input type="tel" class="form-field" placeholder="Telefone">
                <input type="text" class="form-field" placeholder="Empresa">
                <a href="#" class="btn">QUERO COMEÇAR AGORA</a>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="section faq">
        <div class="container">
            <h2>Dúvidas Frequentes</h2>
            <div class="faq-list">
                <div class="faq-item">
                    <h3>Como funciona o processo de trabalho?</h3>
                    <p>Nosso processo é estruturado em etapas claras para garantir os melhores resultados.</p>
                </div>
                <div class="faq-item">
                    <h3>Quais garantias vocês oferecem?</h3>
                    <p>Oferecemos garantia de satisfação e acompanhamento contínuo dos resultados.</p>
                </div>
                <div class="faq-item">
                    <h3>Em quanto tempo vejo resultados?</h3>
                    <p>Os primeiros resultados costumam aparecer já nas primeiras semanas de implementação.</p>
                </div>
                <div class="faq-item">
                    <h3>O investimento vale a pena para meu porte de empresa?</h3>
                    <p>Sim, nossa metodologia é adaptável para empresas de diferentes tamanhos.</p>
                </div>
                <div class="faq-item">
                    <h3>Como é feito o acompanhamento?</h3>
                    <p>Realizamos reuniões periódicas e relatórios detalhados de progresso.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
        <div class="container">
            ${project.data?.visualIdentity?.logoUrl ? 
              `<div class="footer-logo mb-4">
                <img src="${project.data.visualIdentity.logoUrl}" alt="Logo ${project.briefing?.siteName || 'da empresa'}" class="max-h-12 mx-auto" />
              </div>` : 
              ''
            }
            <h3>Entre em Contato</h3>
            <div class="contact-info">
                <div>📧 ${project.briefing?.contactInfo || 'contato@empresa.com'}</div>
                <div>📱 ${project.briefing?.contactInfo || '(11) 99999-9999'}</div>
                <div>🌐 www.empresa.com.br</div>
            </div>
            <p style="margin-top: 2rem; opacity: 0.8;">LinkedIn | Instagram | WhatsApp</p>
        </div>
    </footer>
</body>
</html>`

    // Gerar URL de preview
    const previewUrl = `${process.env.NEXTAUTH_URL}/api/preview/${projectId}`

    // Atualizar projeto com HTML gerado
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        htmlContent: mockHtml,
        previewUrl: previewUrl,
        status: 'HTML_READY',
        updatedAt: new Date()
      },
      include: {
        user: true,
        briefing: true,
        assignedAdmin: true
      }
    })

    // Criar notificação
    await prisma.notification.create({
      data: {
        type: 'HTML_GENERATED',
        title: 'HTML Gerado',
        message: `HTML foi gerado automaticamente para o projeto "${project.name}"`,
        userId: project.userId,
        projectId: project.id,
        read: false
      }
    })

    console.log('✅ HTML gerado com sucesso')
    return NextResponse.json(updatedProject)

  } catch (error) {
    console.error('❌ Erro ao gerar HTML:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}