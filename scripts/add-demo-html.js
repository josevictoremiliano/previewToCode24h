const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProjectWithDemoHtml() {
  console.log('🎨 Adicionando HTML de demonstração ao projeto...');
  
  try {
    // Buscar um projeto existente
    const project = await prisma.project.findFirst({
      where: { status: 'PENDING' }
    });
    
    if (!project) {
      console.log('❌ Nenhum projeto encontrado para demonstração');
      return;
    }
    
    // HTML de demonstração moderno e responsivo
    const demoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sua Landing Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 0;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        nav ul {
            list-style: none;
            display: flex;
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
        
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 120px 0 80px;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            animation: fadeInUp 1s ease-out;
        }
        
        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            animation: fadeInUp 1s ease-out 0.2s both;
        }
        
        .cta-button {
            background: #ff6b6b;
            color: white;
            padding: 15px 40px;
            font-size: 1.1rem;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            animation: fadeInUp 1s ease-out 0.4s both;
        }
        
        .cta-button:hover {
            background: #ff5252;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
        }
        
        .section {
            padding: 80px 0;
        }
        
        .section:nth-child(even) {
            background: #f8f9fa;
        }
        
        .section h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
            color: #333;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 3rem;
            margin-top: 3rem;
        }
        
        .feature {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .feature:hover {
            transform: translateY(-10px);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .feature h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #667eea;
        }
        
        .contact {
            background: #333;
            color: white;
            text-align: center;
        }
        
        .contact-form {
            max-width: 600px;
            margin: 0 auto;
            display: grid;
            gap: 1rem;
        }
        
        .contact-form input,
        .contact-form textarea {
            padding: 15px;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
        }
        
        .contact-form button {
            background: #667eea;
            color: white;
            padding: 15px;
            border: none;
            border-radius: 5px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .contact-form button:hover {
            background: #5a67d8;
        }
        
        footer {
            background: #222;
            color: white;
            text-align: center;
            padding: 2rem 0;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2rem;
            }
            
            nav ul {
                display: none;
            }
            
            .features {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">Sua Empresa</div>
            <ul>
                <li><a href="#inicio">Início</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#servicos">Serviços</a></li>
                <li><a href="#contato">Contato</a></li>
            </ul>
        </nav>
    </header>

    <section id="inicio" class="hero">
        <div class="container">
            <h1>Transforme Seu Negócio Digital</h1>
            <p>Soluções inovadoras para levar sua empresa ao próximo nível</p>
            <a href="#contato" class="cta-button">Comece Agora</a>
        </div>
    </section>

    <section id="sobre" class="section">
        <div class="container">
            <h2>Por Que Nos Escolher?</h2>
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>Resultados Rápidos</h3>
                    <p>Entregamos resultados comprovados em até 30 dias, com foco total na sua satisfação e crescimento do negócio.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💡</div>
                    <h3>Inovação Constante</h3>
                    <p>Utilizamos as tecnologias mais avançadas do mercado para garantir que você esteja sempre à frente da concorrência.</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <h3>Foco no Cliente</h3>
                    <p>Cada projeto é único. Desenvolvemos estratégias personalizadas para atender suas necessidades específicas.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="servicos" class="section">
        <div class="container">
            <h2>Nossos Serviços</h2>
            <div class="features">
                <div class="feature">
                    <h3>Consultoria Digital</h3>
                    <p>Análise completa do seu negócio e estratégias personalizadas para maximizar seus resultados online.</p>
                </div>
                <div class="feature">
                    <h3>Desenvolvimento Web</h3>
                    <p>Sites modernos, responsivos e otimizados para conversão, desenvolvidos com as melhores práticas do mercado.</p>
                </div>
                <div class="feature">
                    <h3>Marketing Digital</h3>
                    <p>Campanhas eficientes em redes sociais, Google Ads e outras plataformas para alavancar suas vendas.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contato" class="contact section">
        <div class="container">
            <h2>Vamos Conversar?</h2>
            <p style="margin-bottom: 2rem;">Entre em contato conosco e descubra como podemos ajudar seu negócio a crescer</p>
            <form class="contact-form">
                <input type="text" placeholder="Seu Nome" required>
                <input type="email" placeholder="Seu E-mail" required>
                <input type="tel" placeholder="Seu Telefone">
                <textarea rows="5" placeholder="Sua Mensagem" required></textarea>
                <button type="submit">Enviar Mensagem</button>
            </form>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; 2024 Sua Empresa. Todos os direitos reservados.</p>
            <p>Desenvolvido com ❤️ para seu sucesso</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling para links âncora
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Formulário de contato
        document.querySelector('.contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Obrigado! Entraremos em contato em breve.');
            this.reset();
        });
    </script>
</body>
</html>`;

    // Atualizar projeto com HTML de demonstração
    const currentData = project.data || {};
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: 'PREVIEW',
        data: {
          ...currentData,
          generatedContent: {
            html: demoHtml,
            copy: 'Conteúdo de demonstração gerado pela IA',
            generatedAt: new Date().toISOString()
          }
        }
      }
    });
    
    console.log(`✅ HTML de demonstração adicionado ao projeto: ${project.name}`);
    console.log(`🌐 Acesse: http://localhost:3000/admin/projects/${project.id}`);
    console.log(`👀 Preview: http://localhost:3000/api/preview/${project.id}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjectWithDemoHtml();