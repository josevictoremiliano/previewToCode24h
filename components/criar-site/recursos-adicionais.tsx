"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface ImageWithPosition {
  file: File
  position: 'hero' | 'about' | 'credibility' | 'gallery' | 'logo' | 'favicon' | 'unassigned'
  id: string
}

interface AdditionalResources {
  images: ImageWithPosition[]
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

const imagePositions = [
  { value: "logo", label: "🏷️ Logo", description: "Logo da empresa (formato recomendado: PNG transparente)" },
  { value: "favicon", label: "🔖 Favicon", description: "Ícone do site (formato recomendado: 32x32px)" },
  { value: "hero", label: "🚀 Hero Principal", description: "Imagem de destaque na primeira seção" },
  { value: "about", label: "👥 Sobre Nós", description: "Foto da equipe ou empresa" },
  { value: "credibility", label: "🏆 Credibilidade", description: "Ambiente profissional ou certificações" },
  { value: "gallery", label: "🖼️ Galeria", description: "Produtos, resultados ou portfólio" },
  { value: "unassigned", label: "📋 Não Definido", description: "Disponível para uso geral" }
]

export function RecursosAdicionais({ data, onUpdate, onNext, onPrevious }: Props) {
  const [formData, setFormData] = useState<AdditionalResources>(data)

  const handleChange = (field: keyof AdditionalResources, value: string | ImageWithPosition[] | string[]) => {
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

    // Converter Files para ImageWithPosition
    const newImages: ImageWithPosition[] = files.map((file, index) => ({
      file,
      position: 'unassigned',
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
    }))

    handleChange("images", [...formData.images, ...newImages])
  }

  const removeImage = (id: string) => {
    const images = formData.images.filter(img => img.id !== id)
    handleChange("images", images)
  }

  const updateImagePosition = (id: string, position: ImageWithPosition['position']) => {
    const images = formData.images.map(img => 
      img.id === id ? { ...img, position } : img
    )
    handleChange("images", images)
  }

  const replaceImage = (id: string, newFile: File) => {
    const images = formData.images.map(img => 
      img.id === id ? { ...img, file: newFile } : img
    )
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
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icons.info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Defina onde cada imagem deve aparecer no site. Você pode alterar, remover ou trocar as imagens.
                  </p>
                </div>
                
                <div className="grid gap-4">
                  {formData.images.map((imageWithPos) => (
                    <div key={imageWithPos.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                      {/* Preview da Imagem */}
                      <div className="relative">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={URL.createObjectURL(imageWithPos.file)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Botão de trocar imagem */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                replaceImage(imageWithPos.id, file)
                                toast.success("Imagem substituída!")
                              }
                            }
                            input.click()
                          }}
                        >
                          <Icons.edit className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Informações e Controles */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium truncate">{imageWithPos.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(imageWithPos.file.size / 1024)} KB
                            </p>
                          </div>
                          
                          {/* Badge da Posição */}
                          <Badge variant={imageWithPos.position === 'unassigned' ? 'secondary' : 'default'}>
                            {imagePositions.find(p => p.value === imageWithPos.position)?.label}
                          </Badge>
                        </div>

                        {/* Seletor de Posição */}
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Onde usar:</Label>
                          <Select
                            value={imageWithPos.position}
                            onValueChange={(value: ImageWithPosition['position']) => 
                              updateImagePosition(imageWithPos.id, value)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {imagePositions.map(position => (
                                <SelectItem key={position.value} value={position.value}>
                                  <div className="flex flex-col">
                                    <span>{position.label}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {position.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = URL.createObjectURL(imageWithPos.file)
                              window.open(url, '_blank')
                            }}
                          >
                            <Icons.eye className="h-3 w-3 mr-1" />
                            Visualizar
                          </Button>
                          
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              removeImage(imageWithPos.id)
                              toast.success("Imagem removida!")
                            }}
                          >
                            <Icons.trash className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Resumo das Posições */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">📊 Resumo das Posições:</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    {imagePositions.map(position => {
                      const count = formData.images.filter(img => img.position === position.value).length
                      return (
                        <div key={position.value} className="text-center">
                          <div className="font-medium">{count}</div>
                          <div className="text-muted-foreground">{position.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
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