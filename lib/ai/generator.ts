/**
 * Gerador de HTML usando IA
 */

interface ProjectData {
  id: string
  name: string
  data: any
  user?: any
}

/**
 * Gera HTML para um projeto usando IA (mock por enquanto)
 */
export async function generateHtmlForProject(project: ProjectData): Promise<string> {
  try {
    console.log('🤖 Iniciando geração de HTML para:', project.name)

    // TODO: Integrar com IA real (Groq, OpenAI, etc.)
    // Por enquanto, vou gerar um HTML básico baseado nos dados do projeto
    
    const projectData = project.data
    const basicInfo = projectData.basicInfo || {}
    const visualIdentity = projectData.visualIdentity || {}
    const content = projectData.content || {}
    const additionalResources = projectData.additionalResources || {}
    
    // Template HTML básico
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${basicInfo.siteName || project.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header */
        header {
            background: ${visualIdentity.primaryColor || '#2563eb'};
            color: white;
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        .logo img {
            height: 40px;
            width: auto;
        }
        
        nav ul {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        nav a {
            color: white;
            text-decoration: none;
            transition: opacity 0.3s;
        }
        
        nav a:hover {
            opacity: 0.8;
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, ${visualIdentity.primaryColor || '#2563eb'}, ${visualIdentity.secondaryColor || '#1d4ed8'});
            color: white;
            text-align: center;
            padding: 4rem 0;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .hero p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .btn {
            display: inline-block;
            background: white;
            color: ${visualIdentity.primaryColor || '#2563eb'};
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: transform 0.3s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        /* Sections */
        .section {
            padding: 4rem 0;
        }
        
        .section-alt {
            background: #f8fafc;
        }
        
        .section h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 2rem;
            color: ${visualIdentity.primaryColor || '#2563eb'};
        }
        
        /* Features Grid */
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .feature {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .feature h3 {
            margin-bottom: 1rem;
            color: ${visualIdentity.primaryColor || '#2563eb'};
        }
        
        /* Contact Section */
        .contact {
            background: ${visualIdentity.primaryColor || '#2563eb'};
            color: white;
        }
        
        .contact-form {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
        }
        
        .form-group textarea {
            height: 120px;
            resize: vertical;
        }
        
        /* Footer */
        footer {
            background: #1f2937;
            color: white;
            text-align: center;
            padding: 2rem 0;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2rem;
            }
            
            nav ul {
                flex-direction: column;
                gap: 1rem;
            }
            
            .header-content {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    ${visualIdentity.logoUrl ? 
                      `<img src="${visualIdentity.logoUrl}" alt="${basicInfo.siteName || project.name}">` :
                      `${basicInfo.siteName || project.name}`
                    }
                </div>
                <nav>
                    <ul>
                        <li><a href="#home">Início</a></li>
                        <li><a href="#about">Sobre</a></li>
                        <li><a href="#services">Serviços</a></li>
                        <li><a href="#contact">Contato</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="container">
            <h1>${basicInfo.siteName || project.name}</h1>
            <p>${basicInfo.slogan || 'Sua solução completa'}</p>
            <a href="#contact" class="btn">Entre em Contato</a>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section">
        <div class="container">
            <h2>Sobre Nós</h2>
            <p style="text-align: center; font-size: 1.1rem; max-width: 800px; margin: 0 auto;">
                ${content.aboutText || `Somos especialistas em ${basicInfo.niche || 'soluções inovadoras'} e estamos aqui para ajudar você a alcançar seus objetivos.`}
            </p>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="section section-alt">
        <div class="container">
            <h2>Nossos Serviços</h2>
            <div class="features">
                ${generateServicesHTML(additionalResources.features, basicInfo.niche)}
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section contact">
        <div class="container">
            <h2>Entre em Contato</h2>
            <form class="contact-form">
                <div class="form-group">
                    <label for="name">Nome</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Mensagem</label>
                    <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" class="btn" style="background: white; color: ${visualIdentity.primaryColor || '#2563eb'};">
                    Enviar Mensagem
                </button>
            </form>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <p>&copy; 2024 ${basicInfo.siteName || project.name}. Todos os direitos reservados.</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling para links internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Formulário de contato
        document.querySelector('.contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Obrigado pela sua mensagem! Entraremos em contato em breve.');
            this.reset();
        });
    </script>
</body>
</html>`

    console.log('✅ HTML gerado com sucesso')
    return html

  } catch (error) {
    console.error('❌ Erro ao gerar HTML:', error)
    throw new Error(`Falha na geração de HTML: ${error.message}`)
  }
}

/**
 * Gera HTML para os serviços baseado nas features selecionadas
 */
function generateServicesHTML(features: string[] = [], niche: string = ''): string {
  const defaultServices = [
    {
      title: 'Qualidade Premium',
      description: 'Oferecemos produtos e serviços de alta qualidade para nossos clientes.'
    },
    {
      title: 'Atendimento Personalizado',
      description: 'Nossa equipe está sempre pronta para atender suas necessidades específicas.'
    },
    {
      title: 'Resultados Garantidos',
      description: 'Trabalhamos com foco em resultados concretos e mensuráveis.'
    }
  ]

  // Mapear features para serviços específicos
  const featureMap: Record<string, any> = {
    'lead-form': {
      title: 'Captação de Leads',
      description: 'Sistema avançado para captar e converter visitantes em clientes.'
    },
    'testimonials': {
      title: 'Depoimentos',
      description: 'Mostre a satisfação dos seus clientes com depoimentos reais.'
    },
    'popup-exit': {
      title: 'Pop-up Inteligente',
      description: 'Capture visitantes que estão prestes a sair do seu site.'
    },
    'seo-optimized': {
      title: 'SEO Otimizado',
      description: 'Seu site otimizado para aparecer no topo do Google.'
    },
    'mobile-responsive': {
      title: 'Mobile Responsivo',
      description: 'Design adaptado para todos os dispositivos móveis.'
    }
  }

  let services = features
    .filter(feature => featureMap[feature])
    .map(feature => featureMap[feature])

  // Se não há features específicas, usar serviços padrão
  if (services.length === 0) {
    services = defaultServices
  }

  return services.map(service => `
    <div class="feature">
      <h3>${service.title}</h3>
      <p>${service.description}</p>
    </div>
  `).join('')
}

export default {
  generateHtmlForProject
}