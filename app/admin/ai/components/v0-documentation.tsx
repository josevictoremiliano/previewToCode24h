'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Icons } from "@/components/icons"

export function V0Documentation() {
  const [isOpen, setIsOpen] = useState(false)

  const features = [
    {
      title: "Landing Pages Profissionais",
      description: "Geração de páginas de alta conversão com design moderno",
      icon: <Icons.fileText className="h-4 w-4" />
    },
    {
      title: "Componentes UI Reutilizáveis", 
      description: "Botões, cards, modais e outros elementos interativos",
      icon: <Icons.play className="h-4 w-4" />
    },
    {
      title: "Design System Consistente",
      description: "Cores, tipografia e espaçamentos padronizados",
      icon: <Icons.image className="h-4 w-4" />
    },
    {
      title: "Responsividade Mobile-First",
      description: "Design otimizado para todos os dispositivos",
      icon: <Icons.smartphone className="h-4 w-4" />
    }
  ]

  const bestPractices = [
    "Use briefings detalhados com cores da marca e público-alvo",
    "Especifique o tipo de página: landing, blog, e-commerce, etc.",
    "Inclua referências visuais e estilo desejado no prompt",
    "Configure corretamente as cores primárias e secundárias",
    "Teste diferentes modelos V0 para resultados variados"
  ]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="mb-6 cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.fileText className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-indigo-900">Documentação V0</CardTitle>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  Guia Completo
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <Icons.chevronUp className="h-4 w-4" />
                ) : (
                  <Icons.chevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="space-y-6 mb-6">
          {/* Recursos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icons.zap className="h-5 w-5 text-purple-600" />
                Recursos V0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-purple-600 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Como Usar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icons.playCircle className="h-5 w-5 text-green-600" />
                Como Usar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Configure a API Key</h4>
                    <p className="text-sm text-gray-600">Obtenha sua chave em vercel.com/dashboard/v0 e configure uma nova configuração de IA</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Preencha o Briefing</h4>
                    <p className="text-sm text-gray-600">Complete as informações do projeto com detalhes sobre negócio, público-alvo e estilo</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Gere o HTML</h4>
                    <p className="text-sm text-gray-600">Use "Gerar Conteúdo" &gt; "Gerar HTML" para criar uma landing page profissional</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Melhores Práticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icons.checkCircle className="h-5 w-5 text-orange-600" />
                Melhores Práticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {bestPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icons.check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{practice}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Exemplo de Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icons.code className="h-5 w-5 text-pink-600" />
                Exemplo de Prompt Otimizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                <div className="text-green-400 mb-2">// Exemplo de prompt para V0</div>
                <div className="text-yellow-300">Create a professional landing page for "TechStart Solutions"</div>
                <br />
                <div className="text-gray-400">Business Details:</div>
                <div>- Business Type: <span className="text-blue-300">SaaS Technology Company</span></div>
                <div>- Target Audience: <span className="text-blue-300">Startup founders and tech entrepreneurs</span></div>
                <div>- Main Services: <span className="text-blue-300">Cloud solutions and consulting</span></div>
                <br />
                <div className="text-gray-400">Design Requirements:</div>
                <div>- Primary Color: <span className="text-purple-300">#3B82F6</span></div>
                <div>- Style: <span className="text-purple-300">Modern, professional, clean</span></div>
                <div>- Sections: <span className="text-purple-300">Hero, features, pricing, contact</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}