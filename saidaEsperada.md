<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulet Criations - Solução para Design e Criação de Artes Digitais</title>
  <meta name="description" content="Bulet Criations é uma solução para design e criação de artes digitais voltada para designers gráficos">
  <meta name="keywords" content="design gráfico, artes digitais, eventos, criação digital">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Bulet Criations - Design e Criação de Artes Digitais">
  <meta property="og:description" content="Solução completa para designers gráficos">
  <meta property="og:type" content="website">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  
  <!-- Phosphor Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css">
  
  <style>
    :root {
      --primary-color: #5a3bf7;
      --secondary-color: #2b6962;
      --text-dark: #1a1a1a;
      --text-light: #6b7280;
      --bg-light: #f8fafc;
      --white: #ffffff;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      --gradient-primary: linear-gradient(135deg, #5a3bf7 0%, #7c5cff 100%);
      --gradient-secondary: linear-gradient(135deg, #2b6962 0%, #3d8b81 100%);
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
      color: var(--text-dark);
      line-height: 1.6;
      overflow-x: hidden;
    }
    
    /* Header */
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      z-index: 1000;
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
      font-size: 1.5rem;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
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
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.3s, box-shadow 0.3s;
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
      min-height: 90vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #5a3bf7 0%, #2b6962 100%);
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/project_1762954055948/images/image-1.jpeg');
      background-size: cover;
      background-position: center;
      opacity: 0.2;
    }
    
    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      position: relative;
      z-index: 1;
    }
    
    .hero-text h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 3.5rem;
      font-weight: 800;
      color: white;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }
    
    .hero-text p {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 2rem;
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
      text-decoration: none;
      font-weight: 700;
      transition: transform 0.3s, box-shadow 0.3s;
      box-shadow: var(--shadow-lg);
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
      padding: 1rem 2rem;
      border: 2px solid white;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
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
      height: auto;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    /* Benefits Section */
    .beneficios {
      padding: 6rem 2rem;
      background: var(--bg-light);
    }
    
    .section-header {
      text-align: center;
      max-width: 700px;
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      font-size: 2rem;
      color: white;
    }
    
    .benefit-card h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--text-dark);
    }
    
    .benefit-card p {
      color: var(--text-light);
      line-height: 1.7;
    }
    
    /* How It Works Section */
    .como-funciona {
      padding: 6rem 2rem;
      background: white;
    }
    
    .steps-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      gap: 3rem;
    }
    
    .step {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 2rem;
      align-items: start;
    }
    
    .step:nth-child(even) {
      direction: rtl;
    }
    
    .step:nth-child(even) > * {
      direction: ltr;
    }
    
    .step-number {
      width: 80px;
      height: 80px;
      background: var(--gradient-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      box-shadow: 0 8px 20px rgba(90, 59, 247, 0.3);
      flex-shrink: 0;
    }
    
    .step-content {
      background: var(--bg-light);
      padding: 2rem;
      border-radius: 16px;
    }
    
    .step-content h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text-dark);
    }
    
    .step-content p {
      color: var(--text-light);
      font-size: 1.125rem;
      line-height: 1.8;
    }
    
    /* Pricing Section */
    .pricing {
      padding: 6rem 2rem;
      background: var(--bg-light);
    }
    
    .pricing-grid {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .pricing-card {
      background: white;
      padding: 3rem 2rem;
      border-radius: 20px;
      box-shadow: var(--shadow);
      transition: transform 0.3s, box-shadow 0.3s;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .pricing-card.featured {
      transform: scale(1.05);
      box-shadow: 0 20px 40px rgba(90, 59, 247, 0.2);
      border: 2px solid var(--primary-color);
    }
    
    .pricing-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: var(--shadow-lg);
    }
    
    .pricing-badge {
      position: absolute;
      top: 20px;
      right: -30px;
      background: var(--gradient-primary);
      color: white;
      padding: 0.5rem 3rem;
      transform: rotate(45deg);
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .pricing-card h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .price {
      font-family: 'Poppins', sans-serif;
      font-size: 3rem;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }
    
    .price-period {
      color: var(--text-light);
      margin-bottom: 2rem;
    }
    
    .features-list {
      list-style: none;
      margin-bottom: 2rem;
      text-align: left;
    }
    
    .features-list li {
      padding: 0.75rem 0;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .features-list i {
      color: var(--primary-color);
      font-size: 1.25rem;
    }
    
    /* Contact Section */
    .contact {
      padding: 6rem 2rem;
      background: white;
    }
    
    .contact-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
    }
    
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .contact-item {
      display: flex;
      align-items: start;
      gap: 1.5rem;
    }
    
    .contact-icon {
      width: 50px;
      height: 50px;
      background: var(--gradient-primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      flex-shrink: 0;
    }
    
    .contact-item h3 {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .contact-item p, .contact-item a {
      color: var(--text-light);
      text-decoration: none;
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .social-link {
      width: 44px;
      height: 44px;
      background: var(--bg-light);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: var(--primary-color);
      transition: all 0.3s;
      text-decoration: none;
    }
    
    .social-link:hover {
      background: var(--gradient-primary);
      color: white;
      transform: translateY(-3px);
    }
    
    .contact-form {
      background: var(--bg-light);
      padding: 2.5rem;
      border-radius: 16px;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-dark);
    }
    
    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-family: inherit;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    
    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }
    
    .submit-button {
      width: 100%;
      background: var(--gradient-primary);
      color: white;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .submit-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(90, 59, 247, 0.3);
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
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 3rem;
      margin-bottom: 2rem;
    }
    
    .footer-section h3 {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .footer-section ul {
      list-style: none;
    }
    
    .footer-section ul li {
      margin-bottom: 0.5rem;
    }
    
    .footer-section a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.3s;
    }
    
    .footer-section a:hover {
      color: white;
    }
    
    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      padding-top: 2rem;
      border-top: 1px solid #374151;
      text-align: center;
      color: #9ca3af;
    }
    
    /* Scroll to Top Button */
    .scroll-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 50px;
      height: 50px;
      background: var(--gradient-primary);
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
      z-index: 999;
      box-shadow: 0 4px 15px rgba(90, 59, 247, 0.3);
    }
    
    .scroll-top.visible {
      opacity: 1;
      visibility: visible;
    }
    
    .scroll-top:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(90, 59, 247, 0.4);
    }
    
    /* Exit Popup */
    .exit-popup {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }
    
    .exit-popup.active {
      opacity: 1;
      visibility: visible;
    }
    
    .popup-content {
      background: white;
      padding: 3rem;
      border-radius: 20px;
      max-width: 500px;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.3s;
    }
    
    .exit-popup.active .popup-content {
      transform: scale(1);
    }
    
    .popup-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-light);
    }
    
    .popup-content h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      margin-bottom: 1rem;
      color: var(--text-dark);
    }
    
    .popup-content p {
      color: var(--text-light);
      margin-bottom: 2rem;
      font-size: 1.125rem;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .nav-links {
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 2rem;
        box-shadow: var(--shadow-lg);
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
      }
      
      .nav-links.active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
      
      .mobile-menu-toggle {
        display: block;
      }
      
      .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .hero-text h1 {
        font-size: 2.5rem;
      }
      
      .hero-image {
        order: -1;
      }
      
      .contact-container {
        grid-template-columns: 1fr;
      }
      
      .step {
        grid-template-columns: 1fr;
      }
      
      .step:nth-child(even) {
        direction: ltr;
      }
      
      .section-header h2 {
        font-size: 2rem;
      }
      
      .pricing-card.featured {
        transform: scale(1);
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <nav>
      <div class="logo">Bulet Criations</div>
      <button class="mobile-menu-toggle" id="mobileMenuToggle">
        <i class="ph ph-list"></i>
      </button>
      <ul class="nav-links" id="navLinks">
        <li><a href="#hero">Início</a></li>
        <li><a href="#beneficios">Benefícios</a></li>
        <li><a href="#como-funciona">Como Funciona</a></li>
        <li><a href="#pricing">Preços</a></li>
        <li><a href="#contact">Contato</a></li>
        <li><a href="#contact" class="cta-button">Participar Agora</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <!-- Hero Section -->
    <section class="hero" id="hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Transforme Suas Ideias em Artes Digitais Incríveis</h1>
          <p>Bulet Criations é a solução completa para designers gráficos que desejam criar artes digitais profissionais para eventos e projetos especiais.</p>
          <div class="hero-buttons">
            <a href="#pricing" class="btn-primary">
              <i class="ph-fill ph-rocket-launch"></i>
              Participar Agora
            </a>
            <a href="#como-funciona" class="btn-secondary">Saiba Mais</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/project_1762954055948/images/image-4.png" alt="Bulet Criations Logo" loading="lazy">
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="beneficios" id="beneficios">
      <div class="section-header">
        <h2>Por Que Escolher Bulet Criations?</h2>
        <p>Descubra os benefícios que vão revolucionar seu trabalho como designer gráfico</p>
      </div>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph-fill ph-palette"></i>
          </div>
          <h3>Design Criativo</h3>
          <p>Ferramentas profissionais para criar designs únicos e impactantes que destacam seu trabalho no mercado.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph-fill ph-lightning"></i>
          </div>
          <h3>Produtividade Acelerada</h3>
          <p>Modelos e recursos prontos que economizam horas de trabalho, permitindo focar na criatividade.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph-fill ph-users-three"></i>
          </div>
          <h3>Comunidade Ativa</h3>
          <p>Faça parte de uma comunidade vibrante de designers que compartilham ideias e experiências.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph-fill ph-trophy"></i>
          </div>
          <h3>Qualidade Premium</h3>
          <p>Recursos de alta qualidade que garantem resultados profissionais em todos os seus projetos.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph-fill ph-clock"></i>
          </div>
          <h3>Suporte 24/7</h3>
          <p>Nossa equipe está sempre disponível para ajudar você a resolver qualquer dúvida ou problema.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">
            <i class="ph-fill ph-download"></i>
          </div>
          <h3>Acesso Ilimitado</h3>
          <p>Download ilimitado de recursos, templates e ferramentas exclusivas para membros.</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="como-funciona" id="como-funciona">
      <div class="section-header">
        <h2>Como Funciona</h2>
        <p>Três passos simples para transformar seu trabalho de design</p>
      </div>
      <div class="steps-container">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Escolha Seu Plano</h3>
            <p>Selecione o plano que melhor se adapta às suas necessidades e comece sua jornada criativa. Oferecemos opções flexíveis para todos os níveis.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Acesse os Recursos</h3>
            <p>Tenha acesso imediato a milhares de templates, modelos e ferramentas profissionais. Tudo organizado para facilitar sua criação.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Crie e Compartilhe</h3>
            <p>Use nossas ferramentas para criar designs incríveis e compartilhe com seus clientes. Entregue projetos profissionais em tempo recorde.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing" id="pricing">
      <div class="section-header">
        <h2>Escolha Seu Plano</h2>
        <p>Planos flexíveis para atender suas necessidades</p>
      </div>
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3>Basic</h3>
          <div class="price">R$ 97,99</div>
          <div class="price-period">por mês</div>
          <ul class="features-list">
            <li><i class="ph-fill ph-check-circle"></i> Acesso a biblioteca básica</li>
            <li><i class="ph-fill ph-check-circle"></i> 50 downloads por mês</li>
            <li><i class="ph-fill ph-check-circle"></i> Suporte por email</li>
            <li><i class="ph-fill ph-check-circle"></i> Atualizações regulares</li>
            <li><i class="ph-fill ph-check-circle"></i> Uso comercial</li>
          </ul>
          <a href="#contact" class="btn-primary" style="width: 100%; justify-content: center;">Começar Agora</a>
        </div>
        <div class="pricing-card featured">
          <div class="pricing-badge">Popular</div>
          <h3>Pro</h3>
          <div class="price">R$ 150,99</div>
          <div class="price-period">por mês</div>
          <ul class="features-list">
            <li><i class="ph-fill ph-check-circle"></i> Acesso completo ilimitado</li>
            <li><i class="ph-fill ph-check-circle"></i> Downloads ilimitados</li>
            <li><i class="ph-fill ph-check-circle"></i> Suporte prioritário 24/7</li>
            <li><i class="ph-fill ph-check-circle"></i> Recursos exclusivos premium</li>
            <li><i class="ph-fill ph-check-circle"></i> Uso comercial ilimitado</li>
            <li><i class="ph-fill ph-check-circle"></i> Atualizações antecipadas</li>
            <li><i class="ph-fill ph-check-circle"></i> Acesso à comunidade VIP</li>
          </ul>
          <a href="#contact" class="btn-primary" style="width: 100%; justify-content: center;">Começar Agora</a>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact" id="contact">
      <div class="section-header">
        <h2>Entre em Contato</h2>
        <p>Estamos aqui para ajudar você a começar</p>
      </div>
      <div class="contact-container">
        <div class="contact-info">
          <div class="contact-item">
            <div class="contact-icon">
              <i class="ph-fill ph-envelope"></i>
            </div>
            <div>
              <h3>Email</h3>
              <a href="mailto:teste@workflow.com">teste@workflow.com</a>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="ph-fill ph-phone"></i>
            </div>
            <div>
              <h3>Telefone</h3>
              <a href="tel:8499847756">(84) 9984-7756</a>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="ph-fill ph-map-pin"></i>
            </div>
            <div>
              <h3>Endereço</h3>
              <p>Rua dos Designs Fuertes</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="ph-fill ph-share-network"></i>
            </div>
            <div>
              <h3>Redes Sociais</h3>
              <div class="social-links">
                <a href="https://wa.me/5584998477756" class="social-link" target="_blank" rel="noopener">
                  <i class="ph-fill ph-whatsapp-logo"></i>
                </a>
                <a href="https://instagram.com/DesignBrow" class="social-link" target="_blank" rel="noopener">
                  <i class="ph-fill ph-instagram-logo"></i>
                </a>
                <a href="https://twitter.com/DesignBrow" class="social-link" target="_blank" rel="noopener">
                  <i class="ph-fill ph-twitter-logo"></i>
                </a>
                <a href="https://facebook.com/DesignBrow" class="social-link" target="_blank" rel="noopener">
                  <i class="ph-fill ph-facebook-logo"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <form class="contact-form" id="contactForm">
          <div class="form-group">
            <label for="name">Nome Completo</label>
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
          <button type="submit" class="submit-button">Enviar Mensagem</button>
        </form>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer>
    <div class="footer-content">
      <div class="footer-section">
        <h3>Bulet Criations</h3>
        <p style="color: #9ca3af; margin-top: 1rem;">Solução completa para design e criação de artes digitais para designers gráficos.</p>
      </div>
      <div class="footer-section">
        <h3>Links Rápidos</h3>
        <ul>
          <li><a href="#hero">Início</a></li>
          <li><a href="#beneficios">Benefícios</a></li>
          <li><a href="#como-funciona">Como Funciona</a></li>
          <li><a href="#pricing">Preços</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Recursos</h3>
        <ul>
          <li><a href="#program">Programa</a></li>
          <li><a href="#design">Design</a></li>
          <li><a href="#modelo">Modelo</a></li>
          <li><a href="#support">Suporte</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Contato</h3>
        <ul>
          <li><a href="mailto:teste@workflow.com">teste@workflow.com</a></li>
          <li><a href="tel:8499847756">(84) 9984-7756</a></li>
          <li>Rua dos Designs Fuertes</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025 Bulet Criations. Todos os direitos reservados.</p>
    </div>
  </footer>

  <!-- Scroll to Top Button -->
  <button class="scroll-top" id="scrollTop">
    <i class="ph ph-arrow-up"></i>
  </button>

  <!-- Exit Popup -->
  <div class="exit-popup" id="exitPopup">
    <div class="popup-content">
      <button class="popup-close" id="popupClose">
        <i class="ph ph-x"></i>
      </button>
      <h2>Espere! Não Vá Ainda! 🎨</h2>
      <p>Antes de sair, que tal conhecer nossa oferta especial? Cadastre-se agora e ganhe <strong>7 dias grátis</strong> para experimentar todos os recursos premium!</p>
      <a href="#pricing" class="btn-primary" style="width: 100%; justify-content: center;">Aproveitar Oferta</a>
    </div>
  </div>

  <script>
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    mobileMenuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuToggle.querySelector('i');
      icon.className = navLinks.classList.contains('active') ? 'ph ph-x' : 'ph ph-list';
    });
    
    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuToggle.querySelector('i').className = 'ph ph-list';
      });
    });
    
    // Scroll to Top Button
    const scrollTop = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollTop.classList.add('visible');
      } else {
        scrollTop.classList.remove('visible');
      }
    });
    
    scrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Exit Popup
    const exitPopup = document.getElementById('exitPopup');
    const popupClose = document.getElementById('popupClose');
    let exitIntentShown = false;
    
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY < 0 && !exitIntentShown) {
        exitPopup.classList.add('active');
        exitIntentShown = true;
      }
    });
    
    popupClose.addEventListener('click', () => {
      exitPopup.classList.remove('active');
    });
    
    exitPopup.addEventListener('click', (e) => {
      if (e.target === exitPopup) {
        exitPopup.classList.remove('active');
      }
    });
    
    // Close popup when clicking CTA
    exitPopup.querySelector('.btn-primary').addEventListener('click', () => {
      exitPopup.classList.remove('active');
    });
    
    // Form Submission
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      
      console.log('[v0] Form submitted:', data);
      
      alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      contactForm.reset();
    });
  </script>
</body>
</html>
