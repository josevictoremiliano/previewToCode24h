"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { useSubscription } from "@/hooks/use-subscription"

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para começar",
    features: [
      "1 site por mês",
      "Templates básicos",
      "Suporte por email",
      "Hospedagem básica",
    ],
    limitations: [
      "Marca d'água Site 24h",
      "Subdomínio apenas",
    ],
    current: true,
  },
  {
    id: "pro",
    name: "Profissional",
    price: "R$ 97",
    period: "/mês",
    description: "Para profissionais e pequenas empresas",
    features: [
      "5 sites por mês",
      "Templates premium",
      "Suporte prioritário",
      "Domínio personalizado",
      "SSL gratuito",
      "Analytics avançado",
      "Backup automático",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Empresarial",
    price: "R$ 197",
    period: "/mês",
    description: "Para agências e grandes empresas",
    features: [
      "Sites ilimitados",
      "Templates exclusivos",
      "Suporte 24/7",
      "Múltiplos domínios",
      "CDN global",
      "Integrações avançadas",
      "White label",
      "Gerente de conta dedicado",
    ],
  },
]

export default function AssinaturaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { usage, isLoading: loadingUsage } = useSubscription()

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true)
    
    try {
      // Simular chamada para API de pagamento
      console.log(`Fazendo upgrade para o plano: ${planId}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Redirecionando para o pagamento...")
      // Aqui você integraria com Stripe, PagSeguro, etc.
    } catch {
      toast.error("Erro ao processar upgrade")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Assinatura cancelada com sucesso")
    } catch {
      toast.error("Erro ao cancelar assinatura")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie seu plano e veja seu uso atual
        </p>
      </div>

      {/* Uso Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.barChart className="h-5 w-5" />
            Uso Atual
          </CardTitle>
          <CardDescription>
            Acompanhe seu uso no plano atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {usage ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Landing pages criadas este mês</span>
                  <span>{usage.sitesUsed}/{usage.sitesLimit}</span>
                </div>
                <Progress 
                  value={(usage.sitesUsed / usage.sitesLimit) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Armazenamento usado</span>
                  <span>{usage.storageUsed}MB/{usage.storageLimit}MB</span>
                </div>
                <Progress 
                  value={(usage.storageUsed / usage.storageLimit) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Icons.spinner className="h-6 w-6 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Mais Popular
              </Badge>
            )}
            {plan.current && (
              <Badge variant="secondary" className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                Plano Atual
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations?.map((limitation, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Icons.x className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">{limitation}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                {plan.current ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCancelSubscription}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Icons.x className="h-4 w-4 mr-2" />
                    )}
                    Cancelar Plano
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Icons.creditCard className="h-4 w-4 mr-2" />
                    )}
                    Fazer Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Histórico de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.receipt className="h-5 w-5" />
            Histórico de Faturas
          </CardTitle>
          <CardDescription>
            Suas últimas faturas e pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Icons.check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Plano Gratuito</p>
                  <p className="text-sm text-muted-foreground">Ativo desde Nov 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">R$ 0,00</p>
                <p className="text-sm text-muted-foreground">Gratuito</p>
              </div>
            </div>
            
            <div className="text-center text-muted-foreground py-8">
              <Icons.receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma fatura anterior encontrada</p>
              <p className="text-sm">Quando você fizer upgrade, suas faturas aparecerão aqui</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}