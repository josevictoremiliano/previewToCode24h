"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface Content {
  description: string
  targetAudience: string
  products: string[]
  cta: string
  sections: string[]
  features: string[]
  videoUrl?: string
}

interface Props {
  data: Content
  onUpdate: (data: Content) => void
  onNext: () => void
  onPrevious: () => void
}

const availableSections = [
  { id: "hero", label: "Seção Hero", description: "Título principal e proposta de valor" },
  { id: "beneficios", label: "Benefícios", description: "Principais vantagens do produto/serviço" },
  { id: "como-funciona", label: "Como Funciona", description: "Processo passo a passo" },
  { id: "depoimentos", label: "Depoimentos", description: "Prova social e testemunhos" },
  { id: "precos", label: "Preços", description: "Planos e valores" },
  { id: "faq", label: "FAQ", description: "Dúvidas frequentes" },
  { id: "garantia", label: "Garantia", description: "Política de satisfação" },
  { id: "urgencia", label: "Urgência", description: "Ofertas por tempo limitado" },
  { id: "sobre", label: "Sobre Nós", description: "História e credibilidade da empresa" },
  { id: "galeria", label: "Galeria", description: "Fotos de produtos ou resultados" },
  { id: "localizacao", label: "Localização", description: "Mapa e endereço físico" },
]

const availableFeatures = [
  { id: "lead-form", label: "Formulário de Captura", description: "Coleta emails e dados de prospects" },
  { id: "countdown-timer", label: "Timer de Urgência", description: "Conta regressiva para ofertas" },
  { id: "whatsapp-chat", label: "Chat WhatsApp", description: "Atendimento direto via WhatsApp" },
  { id: "testimonials", label: "Depoimentos", description: "Prova social com feedbacks" },
  { id: "pricing-table", label: "Tabela de Preços", description: "Comparação de planos/produtos" },
  { id: "video-hero", label: "Vídeo de Apresentação", description: "Player de vídeo na hero section" },
  { id: "popup-exit", label: "Pop-up de Saída", description: "Oferta quando usuário tenta sair" },
  { id: "progress-bar", label: "Barra de Progresso", description: "Passos do processo de compra" },
]

const ctaOptions = [
  "Comprar Agora",
  "Começar Agora",
  "Experimentar Grátis",
  "Baixar Grátis",
  "Inscrever-se",
  "Solicitar Acesso",
  "Garantir Desconto",
  "Participar Agora",
  "Solicitar Demo",
  "Agendar Consulta",
]

export function Conteudo({ data, onUpdate, onNext, onPrevious }: Props) {
  const [formData, setFormData] = useState<Content>(data)
  const [newProduct, setNewProduct] = useState("")

  const handleChange = (field: keyof Content, value: string | string[]) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

  const addProduct = () => {
    if (newProduct.trim()) {
      const products = [...formData.products, newProduct.trim()]
      handleChange("products", products)
      setNewProduct("")
    }
  }

  const removeProduct = (index: number) => {
    const products = formData.products.filter((_, i) => i !== index)
    handleChange("products", products)
  }

  const toggleSection = (sectionId: string) => {
    const sections = formData.sections.includes(sectionId)
      ? formData.sections.filter(s => s !== sectionId)
      : [...formData.sections, sectionId]
    handleChange("sections", sections)
  }

  const toggleFeature = (featureId: string) => {
    const features = (formData.features || []).includes(featureId)
      ? (formData.features || []).filter(f => f !== featureId)
      : [...(formData.features || []), featureId]
    handleChange("features", features)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast.error("Proposta de valor é obrigatória")
      return
    }

    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.fileText className="h-5 w-5" />
          Conteúdo da Landing Page
        </CardTitle>
        <CardDescription>
          Defina o conteúdo persuasivo da sua landing page
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">
              Proposta de Valor <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="O que você oferece? Qual problema resolve? Quais os principais benefícios?"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Público-alvo</Label>
            <Input
              id="targetAudience"
              placeholder="Ex: Empreendedores digitais, gestores de marketing, freelancers..."
              value={formData.targetAudience}
              onChange={(e) => handleChange("targetAudience", e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>O que você está oferecendo?</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Curso online, Software, Consultoria..."
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addProduct())}
              />
              <Button type="button" onClick={addProduct} disabled={!newProduct.trim()}>
                <Icons.plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.products.length > 0 && (
              <div className="space-y-2">
                {formData.products.map((product, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="flex-1 text-sm">{product}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(index)}
                    >
                      <Icons.x className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta">Call-to-Action Principal</Label>
            <select
              id="cta"
              className="w-full p-2 border rounded-md"
              value={formData.cta}
              onChange={(e) => handleChange("cta", e.target.value)}
            >
              <option value="">Selecione uma opção</option>
              {ctaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <Label>Seções Desejadas</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {availableSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    id={section.id}
                    checked={formData.sections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={section.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {section.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Funcionalidades Especiais (Opcional)</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {availableFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={feature.id}
                    checked={(formData.features || []).includes(feature.id)}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={feature.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {feature.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campo de URL do Vídeo - Aparece apenas se "video-hero" estiver selecionado */}
          {(formData.features || []).includes("video-hero") && (
            <div className="space-y-2 p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <Label htmlFor="videoUrl" className="flex items-center gap-2 text-blue-800">
                <Icons.video className="h-4 w-4" />
                URL do Vídeo (YouTube ou Vimeo)
              </Label>
              <Input
                id="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoUrl || ""}
                onChange={(e) => handleChange("videoUrl", e.target.value)}
                className="bg-white"
              />
              <p className="text-xs text-blue-600">
                Cole o link do vídeo que será exibido na seção Hero do seu site.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrevious}>
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button type="submit">
              Próximo
              <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}