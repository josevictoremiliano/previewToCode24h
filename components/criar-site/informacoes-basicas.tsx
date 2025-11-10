"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface BasicInfo {
  siteName: string
  slogan: string
  siteType: string
  niche: string
}

interface Props {
  data: BasicInfo
  onUpdate: (data: BasicInfo) => void
  onNext: () => void
}

const siteTypes = [
  { value: "produto", label: "Landing Page - Produto" },
  { value: "servico", label: "Landing Page - Serviço" },
  { value: "evento", label: "Landing Page - Evento" },
  { value: "captura", label: "Landing Page - Captura de Leads" },
  { value: "vendas", label: "Landing Page - Vendas" },
  { value: "lancamento", label: "Landing Page - Lançamento" },
  { value: "promocional", label: "Landing Page - Promocional" },
  { value: "curso", label: "Landing Page - Curso/Treinamento" },
  { value: "aplicativo", label: "Landing Page - App/Software" },
  { value: "empresa", label: "Landing Page - Institucional" },
]

const niches = [
  { value: "saas", label: "SaaS/Software" },
  { value: "ecommerce", label: "E-commerce/Vendas" },
  { value: "consultoria", label: "Consultoria/Serviços" },
  { value: "educacao", label: "Cursos/Educação" },
  { value: "saude", label: "Saúde/Bem-estar" },
  { value: "financas", label: "Finanças/Investimentos" },
  { value: "marketing", label: "Marketing Digital" },
  { value: "imobiliario", label: "Imóveis/Construção" },
  { value: "eventos", label: "Eventos/Webinars" },
  { value: "alimentacao", label: "Alimentação/Delivery" },
  { value: "beleza", label: "Beleza/Estética" },
  { value: "juridico", label: "Jurídico/Advocacia" },
  { value: "fitness", label: "Fitness/Academia" },
  { value: "turismo", label: "Turismo/Viagens" },
  { value: "tecnologia", label: "Tecnologia/TI" },
  { value: "outro", label: "Outro" },
]

export function InformacoesBasicas({ data, onUpdate, onNext }: Props) {
  const [formData, setFormData] = useState<BasicInfo>(data)

  const handleChange = (field: keyof BasicInfo, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.siteName.trim()) {
      toast.error("Nome da landing page é obrigatório")
      return
    }
    
    if (!formData.siteType) {
      toast.error("Selecione o tipo da landing page")
      return
    }

    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.fileText className="h-5 w-5" />
          Informações Básicas
        </CardTitle>
        <CardDescription>
          Vamos criar sua landing page personalizada em até 24 horas
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">
                Nome da Landing Page <span className="text-red-500">*</span>
              </Label>
              <Input
                id="siteName"
                placeholder="Ex: Lançamento Produto X"
                value={formData.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slogan">Headline Principal</Label>
              <Input
                id="slogan"
                placeholder="Ex: Revolucione seu negócio em 30 dias"
                value={formData.slogan}
                onChange={(e) => handleChange("slogan", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteType">
                Tipo de Landing Page <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.siteType} onValueChange={(value) => handleChange("siteType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Qual tipo de landing page?" />
                </SelectTrigger>
                <SelectContent>
                  {siteTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="niche">Segmento/Nicho</Label>
              <Select value={formData.niche} onValueChange={(value) => handleChange("niche", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  {niches.map((niche) => (
                    <SelectItem key={niche.value} value={niche.value}>
                      {niche.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" className="min-w-[120px]">
              Próximo
              <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}