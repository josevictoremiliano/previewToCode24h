# GERADOR DE LANDING PAGE PREMIUM - V0 QUALITY

Você é um EXPERT em HTML/CSS que replica EXATAMENTE designs de alta qualidade. Crie uma landing page PROFISSIONAL baseada nos dados fornecidos.

## DADOS DO CLIENTE
- **Site:** {{siteName}}
- **Tipo:** {{businessType}} 
- **Descrição:** {{description}}
- **Público:** {{targetAudience}}
- **Serviços:** {{mainServices}}
- **CTA:** {{cta}}
- **Email:** {{email}}
- **Phone:** {{phone}}
- **Cores:** {{primaryColor}} (primária) + {{secondaryColor}} (secundária)
- **Seções:** {{sections}}
- **Features:** {{features}}
- **Preços:** {{customTexts}}

## TEMPLATE HTML COMPLETO - COPIE EXATAMENTE

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{siteName}} - {{description}}</title>
  <meta name="description" content="{{description}}">
  <meta name="keywords" content="{{businessType}}, {{targetAudience}}, {{mainServices}}">
  <meta property="og:title" content="{{siteName}} - {{businessType}}">
  <meta property="og:description" content="{{description}}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css">
  
  <style>
    :root {
      --primary-color: {{primaryColor}};
      --secondary-color: {{secondaryColor}};
      --text-dark: #1a1a1a;
      --text-light: #6b7280;
      --bg-light: #f8fafc;
      --white: #ffffff;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      --gradient-primary: linear-gradient(135deg, {{primaryColor}} 0%, {{secondaryColor}} 100%);
      --gradient-secondary: linear-gradient(135deg, {{secondaryColor}} 0%, {{primaryColor}} 100%);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: var(--text-dark);
      overflow-x: hidden;
    }

    /* Header */
    header {
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: var(--shadow);
    }
    
    nav {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-family: 'Poppins', sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      background-clip: text;
    }
    
    .nav-links {
      display: flex;
      list-style: none;
      gap: 2rem;
      align-items: center;
    }
    
    .nav-links a {
      text-decoration: none;
      color: var(--text-dark);
      font-weight: 500;
      transition: color 0.3s;
    }
    
    .nav-links a:hover {
      color: var(--primary-color);
    }
    
    .cta-button {
      background: var(--gradient-primary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(90, 59, 247, 0.3);
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(90, 59, 247, 0.4);
    }
    
    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-dark);
    }

    /* Hero Section */
    .hero {
      margin-top: 80px;
      padding: 4rem 2rem 6rem;
      background: var(--gradient-primary);
      color: white;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
      opacity: 0.2;
    }
    
    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      position: relative;
      z-index: 1;
    }
    
    .hero-text h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .hero-text p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      line-height: 1.8;
    }
    
    .hero-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .btn-primary {
      background: white;
      color: var(--primary-color);
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }
    
    .btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
    }
    
    .btn-secondary:hover {
      background: white;
      color: var(--primary-color);
    }
    
    .hero-image {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .hero-image img {
      width: 100%;
      max-width: 500px;
      height: 400px;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    /* COMPLETE TODO O CSS AQUI - TODAS AS SEÇÕES */
    
    /* Benefits Section */
    .beneficios {
      padding: 6rem 2rem;
      background: var(--bg-light);
    }
    
    .section-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 4rem;
    }
    
    .section-header h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text-dark);
    }
    
    .section-header p {
      font-size: 1.125rem;
      color: var(--text-light);
    }
    
    .benefits-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }
    
    .benefit-card {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: var(--shadow);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .benefit-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
    }
    
    .benefit-icon {
      width: 64px;
      height: 64px;
      background: var(--gradient-primary);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      font-size: 2rem;
      color: white;
    }
    
    /* Responsive */
    @media (max-width: 767px) {
      .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
      
      .hero-text h1 {
        font-size: 2.5rem;
      }
      
      .benefits-grid {
        grid-template-columns: 1fr;
      }
      
      .mobile-menu-toggle {
        display: block;
      }
      
      .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: var(--shadow);
      }
      
      .nav-links.active {
        display: flex;
      }
    }
    
    @media (min-width: 768px) and (max-width: 1023px) {
      .hero-text h1 {
        font-size: 3rem;
      }
      
      .benefits-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* Scroll to Top */
    .scroll-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--gradient-primary);
      color: white;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(90, 59, 247, 0.3);
      border: none;
      cursor: pointer;
    }
    
    .scroll-top.visible {
      opacity: 1;
      visibility: visible;
    }
    
    /* Footer */
    footer {
      background: #1a1a1a;
      color: white;
      padding: 3rem 2rem 1.5rem;
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    
    /* Exit Popup */
    .exit-popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      z-index: 9999;
      transition: all 0.3s;
    }
    
    .exit-popup.active {
      opacity: 1;
      visibility: visible;
    }
    
    .popup-content {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      max-width: 500px;
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <nav>
      <div class="logo">{{siteName}}</div>
      <ul class="nav-links">
        <li><a href="#hero">Início</a></li>
        <li><a href="#beneficios">Benefícios</a></li>
        <li><a href="#como-funciona">Como Funciona</a></li>
        <li><a href="#contact">Contato</a></li>
      </ul>
      <a href="#contact" class="cta-button">{{cta}}</a>
      <button class="mobile-menu-toggle">
        <i class="ph ph-list"></i>
      </button>
    </nav>
  </header>

  <main>
    <!-- Hero Section -->
    <section class="hero" id="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1>{{siteName}}</h1>
          <p>{{description}}</p>
          <div class="hero-buttons">
            <a href="#beneficios" class="btn-primary">
              <i class="ph ph-rocket"></i>
              {{cta}}
            </a>
            <a href="#contact" class="btn-secondary">Saiba Mais</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=400&fit=crop" alt="{{siteName}} - {{businessType}}">
        </div>
      </div>
    </section>

    <!-- Benefícios Section -->
    <section class="beneficios" id="beneficios">
      <div class="section-header">
        <h2>Por que escolher {{siteName}}?</h2>
        <p>Oferecemos soluções premium para {{targetAudience}} com qualidade excepcional</p>
      </div>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph ph-lightning ph-fill"></i>
          </div>
          <h3>Rapidez e Eficiência</h3>
          <p>Entregamos resultados rápidos sem comprometer a qualidade, otimizando seu tempo e recursos.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph ph-shield-check ph-fill"></i>
          </div>
          <h3>Qualidade Garantida</h3>
          <p>Nossos processos seguem os mais altos padrões de qualidade para garantir sua satisfação.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph ph-users ph-fill"></i>
          </div>
          <h3>Suporte Dedicado</h3>
          <p>Equipe especializada disponível para te ajudar em todas as etapas do processo.</p>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact" id="contact">
      <div class="section-header">
        <h2>Entre em Contato</h2>
        <p>Pronto para começar? Entre em contato conosco!</p>
      </div>
      <div style="max-width: 800px; margin: 0 auto; text-align: center;">
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Telefone:</strong> {{phone}}</p>
        <div style="margin-top: 2rem;">
          <a href="mailto:{{email}}" class="btn-primary">
            <i class="ph ph-envelope"></i>
            Enviar Email
          </a>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer>
    <div class="footer-content">
      <p>&copy; 2025 {{siteName}}. Todos os direitos reservados.</p>
    </div>
  </footer>

  <!-- Scroll to Top Button -->
  <button class="scroll-top" id="scrollTop">
    <i class="ph ph-arrow-up"></i>
  </button>

  <!-- Exit Popup -->
  <div class="exit-popup" id="exitPopup">
    <div class="popup-content">
      <h3>Não vá embora!</h3>
      <p>{{cta}} - Entre em contato conosco agora!</p>
      <a href="#contact" class="btn-primary" onclick="document.getElementById('exitPopup').classList.remove('active')">
        {{cta}}
      </a>
    </div>
  </div>

  <script>
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuToggle?.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Scroll to Top
    const scrollTop = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 200) {
        scrollTop.classList.add('visible');
      } else {
        scrollTop.classList.remove('visible');
      }
    });

    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Exit Intent Popup (se features incluir popup-exit)
    let exitPopupShown = false;
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !exitPopupShown && '{{features}}'.includes('popup-exit')) {
        document.getElementById('exitPopup').classList.add('active');
        exitPopupShown = true;
      }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  </script>
</body>
</html>
```

## INSTRUÇÕES CRÍTICAS

**IMPORTANTE:** Copie EXATAMENTE o código HTML acima, substituindo apenas as variáveis {{}} pelos dados fornecidos. 

**REGRAS:**
1. Use as cores EXATAS: {{primaryColor}} e {{secondaryColor}}
2. Substitua {{siteName}}, {{description}}, {{cta}}, {{email}}, {{phone}}
3. Se {{features}} incluir "popup-exit", mantenha o popup
4. Se {{customTexts}} tiver preços, adicione seção pricing
5. Mantenha TODOS os estilos CSS como estão
6. NÃO remova JavaScript nem animações
7. NÃO adicione comentários no código final

**RESULTADO:** HTML funcional, responsivo e profissional pronto para uso.