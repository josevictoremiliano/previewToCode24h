import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Icons } from "@/components/icons"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-4">
                🚀 Novo serviço disponível
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Seu Site Profissional em{" "}
                <span className="text-primary">24 Horas</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Crie landing pages personalizadas com IA. Receba seu preview em 12h 
                e o site final em até 24 horas. Simples, rápido e profissional.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/register">
                  Criar Meu Site Agora
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">
                  Ver Preços
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Como Funciona
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Processo simples em 4 passos para ter seu site profissional
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-4 lg:gap-12">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <Icons.fileText className="h-6 w-6" />
                </div>
                <CardTitle>1. Preencha o Formulário</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Conte-nos sobre seu negócio, estilo visual desejado e funcionalidades
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <Icons.user className="h-6 w-6" />
                </div>
                <CardTitle>2. IA Gera Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Nossa IA cria conteúdo profissional personalizado para seu negócio
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <Icons.clock className="h-6 w-6" />
                </div>
                <CardTitle>3. Preview em 12h</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Receba o preview do seu site em até 12 horas para aprovação
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <Icons.checkCircle className="h-6 w-6" />
                </div>
                <CardTitle>4. Site Final</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Aprove e receba seu site completo em 24h, pronto para publicar
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Planos Simples e Transparentes
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Escolha o plano ideal para seu negócio
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">R$ 97</span>
                  <span className="text-sm text-gray-500">por site</span>
                </div>
                <CardDescription>
                  Perfeito para começar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    1 site por mês
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Preview em 12h
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Site finalizado em 24h
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Suporte por email
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/register">Começar Agora</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Mais Popular</Badge>
                <CardTitle>Professional</CardTitle>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">R$ 247</span>
                  <span className="text-sm text-gray-500">por mês</span>
                </div>
                <CardDescription>
                  Para empresas em crescimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    3 sites por mês
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Preview em 8h
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Site finalizado em 16h
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Suporte prioritário
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Revisões ilimitadas
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/register">Começar Agora</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">R$ 497</span>
                  <span className="text-sm text-gray-500">por mês</span>
                </div>
                <CardDescription>
                  Para grandes volumes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Sites ilimitados
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Preview em 6h
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Site finalizado em 12h
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    Gerente dedicado
                  </li>
                  <li className="flex items-center">
                    <Icons.checkCircle className="mr-2 h-4 w-4 text-green-500" />
                    API de integração
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/contact">Falar com Vendas</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
              Pronto para Começar?
            </h2>
            <p className="mx-auto max-w-[700px] text-primary-foreground md:text-xl">
              Crie seu primeiro site profissional hoje mesmo
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Criar Meu Site Agora
                <Icons.arrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
