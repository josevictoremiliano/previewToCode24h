"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function TestAIPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")

  const testAI = async () => {
    setIsLoading(true)
    setResult("")
    
    try {
      const testData = {
        basicInfo: {
          siteName: "Site Teste",
          businessType: "E-commerce",
          description: "Uma loja virtual de produtos artesanais",
          targetAudience: "Pessoas que valorizam produtos únicos",
          goals: ["Vender online", "Construir marca"]
        },
        designPreferences: {
          style: "Moderno",
          colors: ["#FF6B6B", "#4ECDC4"],
          inspiration: "Sites limpos e minimalistas"
        },
        contentInfo: {
          pages: ["Home", "Produtos", "Sobre", "Contato"],
          hasLogo: false,
          hasImages: true,
          copywriting: "Sim, preciso de textos"
        },
        technical: {
          features: ["Carrinho de compras", "Pagamento online", "Blog"],
          integrations: ["PayPal", "Mercado Pago"],
          seo: true
        },
        timeline: {
          deadline: "1 semana",
          priority: "Alto"
        }
      }

      const response = await fetch('/api/test-ai-processing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })

      if (!response.ok) {
        throw new Error('Erro na resposta da API')
      }

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
      toast.success("Teste de IA executado com sucesso!")
      
    } catch (error) {
      console.error('Erro no teste:', error)
      toast.error("Erro ao executar teste de IA")
      setResult(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Processamento de IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testAI} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processando..." : "Testar IA"}
          </Button>
          
          {result && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Resultado:</h3>
              <Textarea 
                value={result}
                readOnly
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}