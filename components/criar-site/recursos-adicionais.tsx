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

interface AdditionalResources {
  images: File[]
  customTexts: string
  features: string[]
}

interface Props {
  data: AdditionalResources
  onUpdate: (data: AdditionalResources) => void
  onNext: () => void
  onPrevious: () => void
}

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

export function RecursosAdicionais({ data, onUpdate, onNext, onPrevious }: Props) {
  const [formData, setFormData] = useState<AdditionalResources>(data)

  const handleChange = (field: keyof AdditionalResources, value: string | File[] | string[]) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validar tamanho total (máximo 50MB)
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > 50 * 1024 * 1024) {
      toast.error("Tamanho total das imagens excede 50MB")
      return
    }

    // Validar tipos de arquivo
    const invalidFiles = files.filter(file => !file.type.startsWith("image/"))
    if (invalidFiles.length > 0) {
      toast.error("Apenas arquivos de imagem são permitidos")
      return
    }

    handleChange("images", [...formData.images, ...files])
  }

  const removeImage = (index: number) => {
    const images = formData.images.filter((_, i) => i !== index)
    handleChange("images", images)
  }

  const toggleFeature = (featureId: string) => {
    const features = formData.features.includes(featureId)
      ? formData.features.filter(f => f !== featureId)
      : [...formData.features, featureId]
    handleChange("features", features)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.plus className="h-5 w-5" />
          Recursos de Conversão
        </CardTitle>
        <CardDescription>
          Adicione elementos que aumentam a conversão
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Imagens */}
          <div className="space-y-3">
            <Label>Imagens do Produto/Serviço (Opcional)</Label>
            <p className="text-sm text-muted-foreground">
              Adicione imagens do produto, mockups, resultados ou equipe. Máximo 10 imagens, 5MB cada.
            </p>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Icons.upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="images-upload" className="cursor-pointer">
                  <span className="text-primary hover:underline">
                    Clique para fazer upload
                  </span>
                  <span className="text-muted-foreground"> ou arraste e solte</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG até 5MB cada (máximo 10 imagens)
                </p>
                <Input
                  id="images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      <Icons.x className="h-3 w-3" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Textos Personalizados */}
          <div className="space-y-2">
            <Label htmlFor="customTexts">Conteúdos Específicos (Opcional)</Label>
            <Textarea
              id="customTexts"
              placeholder="Descreva textos específicos que gostaria de incluir no site, missão da empresa, valores, história especial, etc."
              value={formData.customTexts}
              onChange={(e) => handleChange("customTexts", e.target.value)}
              rows={4}
            />
          </div>

          {/* Funcionalidades Especiais */}
          <div className="space-y-3">
            <Label>Funcionalidades Especiais (Opcional)</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {availableFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    id={feature.id}
                    checked={formData.features.includes(feature.id)}
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