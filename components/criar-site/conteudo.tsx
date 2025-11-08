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
}

interface Props {
  data: Content
  onUpdate: (data: Content) => void
  onNext: () => void
  onPrevious: () => void
}

const availableSections = [
  { id: "sobre", label: "Sobre", description: "História e valores da empresa" },
  { id: "servicos", label: "Serviços", description: "O que você oferece" },
  { id: "portfolio", label: "Portfólio", description: "Trabalhos realizados" },
  { id: "depoimentos", label: "Depoimentos", description: "Feedback dos clientes" },
  { id: "contato", label: "Contato", description: "Informações de contato" },
  { id: "blog", label: "Blog", description: "Artigos e notícias" },
  { id: "faq", label: "FAQ", description: "Perguntas frequentes" },
  { id: "equipe", label: "Equipe", description: "Conheça nosso time" },
]

const ctaOptions = [
  "Fale Conosco",
  "Solicite um Orçamento",
  "Comprar Agora",
  "Saiba Mais",
  "Entre em Contato",
  "Agende uma Consulta",
  "Baixe Grátis",
  "Cadastre-se",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description.trim()) {
      toast.error("Descrição do negócio é obrigatória")
      return
    }

    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.fileText className="h-5 w-5" />
          Conteúdo do Site
        </CardTitle>
        <CardDescription>
          Descreva seu negócio e estruture o conteúdo
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição do Negócio/Site <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Conte sobre sua empresa, o que faz, seus diferenciais..."
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
              placeholder="Ex: Pequenas empresas, jovens profissionais, famílias..."
              value={formData.targetAudience}
              onChange={(e) => handleChange("targetAudience", e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Principais Produtos/Serviços</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite um produto ou serviço"
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