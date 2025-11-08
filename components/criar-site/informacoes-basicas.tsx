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
  { value: "landing-page", label: "Landing Page" },
  { value: "institucional", label: "Site Institucional" },
  { value: "portfolio", label: "Portfólio" },
  { value: "loja-virtual", label: "Loja Virtual" },
  { value: "blog", label: "Blog" },
  { value: "servicos", label: "Serviços" },
  { value: "restaurante", label: "Restaurante" },
  { value: "consultoria", label: "Consultoria" },
  { value: "educacao", label: "Educação" },
  { value: "saude", label: "Saúde" },
]

const niches = [
  { value: "tecnologia", label: "Tecnologia" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "financas", label: "Finanças" },
  { value: "marketing", label: "Marketing" },
  { value: "design", label: "Design" },
  { value: "consultoria", label: "Consultoria" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "moda", label: "Moda" },
  { value: "esportes", label: "Esportes" },
  { value: "turismo", label: "Turismo" },
  { value: "imobiliario", label: "Imobiliário" },
  { value: "juridico", label: "Jurídico" },
  { value: "beleza", label: "Beleza" },
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
      toast.error("Nome do site é obrigatório")
      return
    }
    
    if (!formData.siteType) {
      toast.error("Selecione o tipo do site")
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
          Conte-nos sobre seu projeto e negócio
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteName">
                Nome do Site/Empresa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="siteName"
                placeholder="Ex: Minha Empresa Ltda"
                value={formData.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan/Frase de Efeito</Label>
              <Input
                id="slogan"
                placeholder="Ex: Transformando ideias em realidade"
                value={formData.slogan}
                onChange={(e) => handleChange("slogan", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteType">
                Tipo de Site <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.siteType} onValueChange={(value) => handleChange("siteType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
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