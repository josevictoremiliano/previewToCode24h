import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased selection:bg-sky-500 selection:text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Placeholder */}
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">O</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Ozires</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Funcionalidades
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Planos
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="hidden sm:block px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-colors"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 hero-glow pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-sky-500 mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Novidade: Hospedagem inclusa em todos os planos
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 max-w-4xl mx-auto leading-tight">
              A reimaginação de como você cria Landing Pages.
            </h1>

            <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Tire sua ideia do papel. Em 24h seu site no ar com hospedagem
              inclusa de forma fácil e prática. Chega de dor de cabeça com
              infraestrutura.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#pricing"
                className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg shadow-sky-500/25"
              >
                Ver Planos e Preços
              </a>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-full transition-all backdrop-blur-sm"
              >
                Como funciona?
              </a>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="mt-20 relative max-w-5xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-purple-600 rounded-2xl blur opacity-20"></div>
              <div className="relative rounded-2xl bg-[#09090b] border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src="https://placehold.co/1200x800/18181b/FFF?text=Ozires+Dashboard+Preview"
                  alt="App Interface"
                  className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-700"
                />

                {/* Floating Elements (Decoration) */}
                <div className="absolute top-10 right-10 glass-card p-4 rounded-xl shadow-xl hidden lg:block animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">Status</p>
                      <p className="text-sm font-bold text-white">
                        Site Publicado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section (Bento Grid) */}
        <section id="features" className="py-24 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Tudo que você precisa para vender mais
              </h2>
              <p className="text-zinc-400">
                Focamos na tecnologia para você focar no seu negócio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Large */}
              <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-sky-500/20"></div>
                <h3 className="text-2xl font-bold mb-2">Entrega em 24 horas</h3>
                <p className="text-zinc-400 mb-6 max-w-md">
                  Não perca tempo configurando servidores. Nós entregamos sua
                  landing page pronta para receber tráfego em tempo recorde.
                </p>
                <div className="h-32 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl border border-white/5 flex items-center justify-center">
                  <span className="text-4xl font-mono text-sky-500">
                    24:00:00
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="glass-card rounded-3xl p-8 group hover:border-sky-500/30 transition-colors">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Hospedagem Inclusa</h3>
                <p className="text-zinc-400 text-sm">
                  Servidores de alta performance já configurados. Zero custo
                  extra.
                </p>
              </div>

              {/* Card 3 */}
              <div className="glass-card rounded-3xl p-8 group hover:border-sky-500/30 transition-colors">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-6">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Suporte 24/7</h3>
                <p className="text-zinc-400 text-sm">
                  Nossa equipe técnica está sempre disponível para garantir que
                  seu site nunca pare.
                </p>
              </div>

              {/* Card 4: Large */}
              <div className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-sky-900/20 to-transparent"></div>
                <h3 className="text-2xl font-bold mb-2">Design Premium</h3>
                <p className="text-zinc-400 mb-6">
                  Layouts otimizados para conversão e responsivos para qualquer
                  dispositivo.
                </p>
                <div className="grid grid-cols-3 gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="h-20 bg-zinc-800 rounded-lg"></div>
                  <div className="h-20 bg-zinc-800 rounded-lg"></div>
                  <div className="h-20 bg-zinc-800 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative">
          <div className="absolute inset-0 bg-zinc-900/50 skew-y-3 transform origin-bottom-right -z-10"></div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Planos Simples e Transparentes
              </h2>
              <p className="text-zinc-400">
                Comece pequeno e cresça com a gente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="text-lg font-medium text-zinc-400">Starter</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    R$ 59,90
                  </span>
                  <span className="text-zinc-500">/mês</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    1 Landing Page
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Hospedagem Inclusa
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    SSL Grátis
                  </li>
                </ul>
                <Link
                  href="#"
                  className="mt-8 block w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center font-semibold transition-colors"
                >
                  Escolher Starter
                </Link>
              </div>

              {/* Pro Plan (Featured) */}
              <div className="glass-card p-8 rounded-3xl border border-sky-500/50 relative transform md:-translate-y-4 shadow-2xl shadow-sky-900/20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-sky-500 text-white text-xs font-bold uppercase tracking-wide rounded-full">
                  Mais Popular
                </div>
                <h3 className="text-lg font-medium text-sky-400">Pro</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    R$ 99,90
                  </span>
                  <span className="text-zinc-500">/mês</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Até 3 Landing Pages
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Domínio Personalizado
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Analytics Avançado
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Suporte Prioritário
                  </li>
                </ul>
                <Link
                  href="#"
                  className="mt-8 block w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 rounded-xl text-center font-semibold transition-colors shadow-lg shadow-sky-500/25"
                >
                  Escolher Pro
                </Link>
              </div>

              {/* Agency Plan */}
              <div className="glass-card p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="text-lg font-medium text-zinc-400">Agency</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    R$ 199,90
                  </span>
                  <span className="text-zinc-500">/mês</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Ilimitadas Landing Pages
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    White Label
                  </li>
                  <li className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-sky-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Gerente de Conta
                  </li>
                </ul>
                <Link
                  href="#"
                  className="mt-8 block w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center font-semibold transition-colors"
                >
                  Falar com Vendas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-sky-900/20 to-purple-900/20 z-0"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Pronto para revolucionar sua presença digital?
                </h2>
                <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
                  Junte-se a centenas de empreendedores que já estão vendendo
                  mais com a Ozires.
                </p>
                <Link
                  href="/register"
                  className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors transform hover:scale-105"
                >
                  Criar Minha Conta Grátis
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sky-600 rounded flex items-center justify-center text-xs font-bold">
              O
            </div>
            <span className="font-bold text-lg">Ozires</span>
          </div>
          <div className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Ozires Tecnologia. Todos os
            direitos reservados.
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              Termos
            </a>
            <a
              href="#"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              Privacidade
            </a>
            <a
              href="#"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
