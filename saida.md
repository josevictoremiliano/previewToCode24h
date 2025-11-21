<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Bulet Criations - Soluções Digitais</title>
<meta name="description" content="Empresa especializada em soluções digitais inovadoras.">
<meta name="keywords" content="digital, soluções, SaaS, desenvolvimento">
<meta property="og:title" content="Bulet Criations - Soluções Digitais">
<meta property="og:description" content="Empresa especializada em soluções digitais inovadoras.">
<meta property="og:image" content="https://via.placeholder.com/1200x630">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="https://via.placeholder.com/32">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css">
<style>
:root{
  --primary-color:#3B82F6;
  --secondary-color:#1E40AF;
  --text-dark:#1a1a1a;
  --text-light:#6b7280;
  --bg-light:#f8fafc;
  --white:#ffffff;
  --shadow:0 4px 6px -1px rgba(0,0,0,.1);
  --shadow-lg:0 10px 15px -3px rgba(0,0,0,.1);
  --radius:12px;
}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;font-size:16px;}
body{font-family:'Inter',sans-serif;color:var(--text-dark);background:var(--bg-light);}
a{color:inherit;text-decoration:none;}
ul{list-style:none;}
header{background:rgba(255,255,255,.8);backdrop-filter:blur(10px);position:sticky;top:0;z-index:1000;}
nav{max-width:1200px;margin:auto;padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;}
.logo{font-size:1.5rem;font-weight:700;color:var(--primary-color);}
.menu{display:flex;align-items:center;}
.menu li{margin-left:1.5rem;}
.menu a{font-weight:600;transition:color .3s;}
.menu a:hover{color:var(--secondary-color);}
.menu-btn{display:none;cursor:pointer;font-size:1.5rem;}
.cta-btn{background:var(--primary-color);color:var(--white);padding:.75rem 1.5rem;border-radius:var(--radius);border:none;font-weight:600;transition:background .3s;}
.cta-btn:hover{background:var(--secondary-color);}
.hero{background:linear-gradient(135deg,#3B82F6,#1E40AF);color:var(--white);display:flex;align-items:center;justify-content:center;padding:4rem 1.5rem;text-align:center;}
.hero-content{max-width:800px;}
.hero h1{font-size:2.5rem;margin-bottom:.5rem;}
.hero h2{font-size:1.75rem;margin-bottom:1rem;}
.hero p{font-size:1.125rem;margin-bottom:2rem;}
.hero .hero-image{margin-top:2rem;}
.hero img{width:500px;height:400px;object-fit:cover;border-radius:var(--radius);box-shadow:var(--shadow-lg);}
.about{padding:4rem 1.5rem;background:var(--white);display:flex;flex-wrap:wrap;align-items:center;justify-content:center;}
.about .text{flex:1 1 400px;margin-right:2rem;}
.about h2{font-size:2rem;margin-bottom:1rem;}
.about p{font-size:1.125rem;margin-bottom:2rem;}
.about .cards{display:flex;flex-wrap:wrap;gap:1rem;}
.card{background:var(--white);border-radius:var(--radius);box-shadow:var(--shadow);padding:1.5rem;flex:1 1 200px;text-align:center;}
.card h3{font-size:1.25rem;margin:1rem 0 .5rem;}
.card p{font-size:1rem;color:var(--text-light);}
.about .image{flex:1 1 400px;}
.about img{width:100%;max-width:400px;height:300px;object-fit:cover;border-radius:var(--radius);box-shadow:var(--shadow);}
.services{padding:4rem 1.5rem;background:var(--bg-light);}
.services h2{text-align:center;font-size:2rem;margin-bottom:2rem;}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;}
.service-card{background:var(--white);border-radius:var(--radius);box-shadow:var(--shadow);padding:2rem;text-align:center;transition:transform .3s,box-shadow .3s;}
.service-card:hover{transform:translateY(-5px);box-shadow:var(--shadow-lg);}
.service-card .icon{font-size:3rem;color:var(--primary-color);margin-bottom:.75rem;}
.service-card h3{font-size:1.25rem;margin:1rem 0 .5rem;}
.service-card p{font-size:1rem;color:var(--text-light);}
.testimonials{padding:4rem 1.5rem;background:var(--white);text-align:center;}
.testimonials h2{font-size:2rem;margin-bottom:2rem;}
.testimonial-card{display:inline-block;width:90%;max-width:400px;background:var(--white);border-radius:var(--radius);box-shadow:var(--shadow);padding:2rem;margin:0 1rem;vertical-align:top;position:relative;}
.testimonial-card .avatar{width:60px;height:60px;border-radius:50%;margin:-30px auto 1rem;display:block;object-fit:cover;}
.testimonial-card p{font-size:1rem;color:var(--text-light);margin-bottom:1rem;}
.testimonial-card h4{font-weight:600;margin-bottom:.5rem;}
.testimonial-card span{font-size:.875rem;color:var(--text-light);}
.contact{padding:4rem 1.5rem;background:var(--bg-light);}
.contact h2{text-align:center;font-size:2rem;margin-bottom:2rem;}
.form-wrapper{max-width:600px;margin:auto;background:var(--white);border-radius:var(--radius);box-shadow:var(--shadow);padding:2rem;}
.form-group{margin-bottom:1.5rem;}
.form-group label{display:block;font-weight:600;margin-bottom:.5rem;}
.form-group input,.form-group textarea{width:100%;padding:.75rem;border:1px solid var(--text-light);border-radius:var(--radius);font-size:1rem;}
.form-group textarea{height:120px;resize:none;}
.form-group input:focus,.form-group textarea:focus{outline:none;border-color:var(--primary-color);}
.btn-submit{background:var(--primary-color);color:var(--white);padding:.75rem 1.5rem;border:none;border-radius:var(--radius);font-weight:600;cursor:pointer;transition:background .3s;}
.btn-submit:hover{background:var(--secondary-color);}
.contact-info{margin-top:2rem;text-align:center;}
.contact-info p{margin-bottom:.5rem;}
.social{margin-top:1rem;}
.social a{margin:0 .5rem;font-size:1.5rem;color:var(--text-light);transition:color .3s;}
.social a:hover{color:var(--primary-color);}
footer{background:var(--primary-color);color:var(--white);padding:2rem 1.5rem;text-align:center;}
footer a{color:var(--white);margin:0 .75rem;}
.scroll-top{position:fixed;bottom:2rem;right:2rem;background:var(--primary-color);color:var(--white);width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow);display:none;transition:background .3s;}
.scroll-top:hover{background:var(--secondary-color);}
@media(max-width:768px){
  nav .menu{display:none;}
  nav .menu-btn{display:block;}
  .about{flex-direction:column;}
  .about .text{margin-right:0;margin-bottom:2rem;}
}
@media(max-width:1024px){
  .hero h1{font-size:2rem;}
  .hero h2{font-size:1.5rem;}
}
</style>
</head>
<body>
<header>
  <nav>
    <div class="logo">Bulet Criations</div>
    <ul class="menu">
      <li><a href="#hero">Início</a></li>
      <li><a href="#about">Sobre</a></li>
      <li><a href="#services">Serviços</a></li>
      <li><a href="#testimonials">Depoimentos</a></li>
      <li><a href="#contact">Contato</a></li>
      <li><a href="#contact" class="cta-btn">Entre em contato</a></li>
    </ul>
    <div class="menu-btn" id="menuBtn"><span class="ph ph-list"></span></div>
  </nav>
</header>

<main>
  <section class="hero" id="hero">
    <div class="hero-content">
      <h1>Transformamos Ideias em Soluções Digitais</h1>
      <h2>Soluções sob medida para sua empresa</h2>
      <p>Na Bulet Criations, entregamos projetos de alta qualidade que impulsionam seu negócio para o futuro.</p>
      <a href="#services" class="cta-btn">Saiba mais</a>
      <div class="hero-image"><img src="https://via.placeholder.com/500x400" alt="Imagem de destaque" loading="lazy"></div>
    </div>
  </section>

  <section class="about" id="about">
    <div class="text">
      <h2>Sobre Nós</h2>
      <p>Somos uma equipe de profissionais apaixonados por tecnologia e inovação, focados em criar soluções digitais que transformam negócios.</p>
      <div class="cards">
        <div class="card"><h3>Inovação</h3><p>Adotamos as últimas tendências para entregar resultados diferenciados.</p></div>
        <div class="card"><h3>Qualidade</h3><p>Compromisso com excelência em cada etapa do desenvolvimento.</p></div>
        <div class="card"><h3>Suporte</h3><p>Suporte contínuo para garantir o sucesso da sua solução.</p></div>
      </div>
    </div>
    <div class="image"><img src="https://via.placeholder.com/400x300" alt="Equipe trabalhando" loading="lazy"></div>
  </section>

  <section class="services" id="services">
    <h2>Serviços</h2>
    <div class="grid">
      <div class="service-card">
        <span class="ph ph-rocket ph-fill service-icon"></span>
        <h3>Desenvolvimento Web</h3>
        <p>Criação de sites responsivos, aplicações web e e-commerce com foco em performance e UX.</p>
      </div>
      <div class="service-card">
        <span class="ph ph-bullhorn ph-fill service-icon"></span>
        <h3>Marketing Digital</h3>
        <p>Campanhas integradas, SEO, mídia paga e automação para aumentar sua visibilidade online.</p>
      </div>
      <div class="service-card">
        <span class="ph ph-gear ph-fill service-icon"></span>
        <h3>Consultoria Estratégica</h3>
        <p>Planejamento de crescimento, análise de mercado e otimização de processos digitais.</p>
      </div>
    </div>
  </section>

  <section class="testimonials" id="testimonials">
    <h2>Depoimentos</h2>
    <div class="testimonial-card">
      <img class="avatar" src="https://via.placeholder.com/60" alt="Foto do cliente">
      <p>"A Bulet Criations entregou nosso site em tempo recorde e com qualidade excepcional." </p>
      <h4>Maria Silva</h4>
      <span>CEO, Empresa X</span>
    </div>
    <div class="testimonial-card">
      <img class="avatar" src="https://via.placeholder.com/60" alt="Foto do cliente">
      <p>"A equipe foi proativa e sempre pronta para ajustar o projeto conforme nossas necessidades." </p>
      <h4>João Pereira</h4>
      <span>Diretor de Marketing, Empresa Y</span>
    </div>
    <div class="testimonial-card">
      <img class="avatar" src="https://via.placeholder.com/60" alt="Foto do cliente">
      <p>"Resultados além das expectativas. Recomendo a Bulet para quem busca inovação." </p>
      <h4>Carla Souza</h4>
      <span>Gerente de TI, Empresa Z</span>
    </div>
  </section>

  <section class="contact" id="contact">
    <h2>Contato</h2>
    <div class="form-wrapper">
      <form id="contactForm" novalidate>
        <div class="form-group"><label for="name">Nome</label><input type="text" id="name" required></div>
        <div class="form-group"><label for="email">E-mail</label><input type="email" id="email" required></div>
        <div class="form-group"><label for="message">Mensagem</label><textarea id="message" required></textarea></div>
        <button type="submit" class="btn-submit">Enviar</button>
      </form>
    </div>
    <div class="contact-info">
      <p>Telefone: (00) 1234-5678</p>
      <p>E-mail: contato@buletcriations.com</p>
      <div class="social">
        <a href="#"><span class="ph ph-facebook"></span></a>
        <a href="#"><span class="ph ph-linkedin"></span></a>
        <a href="#"><span class="ph ph-instagram"></span></a>
      </div>
    </div>
  </section>
</main>

<footer>
  <p><a href="#hero">Início</a> <a href="#about">Sobre</a> <a href="#services">Serviços</a> <a href="#testimonials">Depoimentos</a> <a href="#contact">Contato</a></p>
  <p>© 2025 Bulet Criations. Todos os direitos reservados.</p>
</footer>

<button class="scroll-top" id="scrollTop"><span class="ph ph-arrow-up"></span></button>

<script>
const menuBtn=document.getElementById('menuBtn');
const navMenu=document.querySelector('.menu');
menuBtn.addEventListener('click',()=>{navMenu.classList.toggle('open');});
const scrollTopBtn=document.getElementById('scrollTop');
window.addEventListener('scroll',()=>{scrollTopBtn.style.display=window.scrollY>200?'flex':'none';});
scrollTop