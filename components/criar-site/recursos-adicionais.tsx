"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

interface ImageWithPosition {
  file: File
  position: 'hero' | 'about' | 'credibility' | 'gallery' | 'logo' | 'favicon' | 'unassigned'
  id: string
}

interface AdditionalResources {
  images: ImageWithPosition[]
  customTexts: string
  aiGeneratedImages: boolean
}

interface Props {
  data: AdditionalResources
  selectedSections: string[]
  onUpdate: (data: AdditionalResources) => void
  onNext: () => void
  onPrevious: () => void
}

const allImagePositions = [
  { value: "logo", label: "🏷️ Logo", description: "Logo da empresa (formato recomendado: PNG transparente)", required: true },
  { value: "favicon", label: "🔖 Favicon", description: "Ícone do site (formato recomendado: 32x32px)", required: true },
  { value: "hero", label: "🚀 Hero Principal", description: "Imagem de destaque na primeira seção", section: "hero" },
  { value: "about", label: "👥 Sobre Nós", description: "Foto da equipe ou empresa", section: "about" },
  { value: "credibility", label: "🏆 Credibilidade", description: "Ambiente profissional ou certificações", section: "credibility" },
  { value: "gallery", label: "🖼️ Galeria", description: "Produtos, resultados ou portfólio", section: "gallery" },
  { value: "unassigned", label: "📋 Não Definido", description: "Disponível para uso geral" }
]

export function RecursosAdicionais({ data, selectedSections, onUpdate, onNext, onPrevious }: Props) {
  const [formData, setFormData] = useState<AdditionalResources>(data)
  const [isDragging, setIsDragging] = useState(false)

  // Filtrar posições baseadas nas seções selecionadas
  const filteredPositions = useMemo(() => {
    return allImagePositions.filter(pos => {
      // Logo, Favicon e Unassigned sempre aparecem
      if (!pos.section) return true
      // Outras posições dependem da seção estar selecionada
      if (!selectedSections || selectedSections.length === 0) return true

      return selectedSections.includes(pos.section)
    })
  }, [selectedSections])

  const handleChange = (field: keyof AdditionalResources, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)

    // Validar tamanho total (máximo 50MB)
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > 50 * 1024 * 1024) {
      toast.error("Tamanho total das imagens excede 50MB")
      return
    }

    // Validar tipos de arquivo
    const invalidFiles = fileArray.filter(file => !file.type.startsWith("image/"))
    if (invalidFiles.length > 0) {
      toast.error("Apenas arquivos de imagem são permitidos")
      return
    }

    // Converter Files para ImageWithPosition
    const newImages: ImageWithPosition[] = fileArray.map((file, index) => ({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  // Drag and Drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleImageUpload(e.dataTransfer.files)
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
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* AI Image Generation Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base">Geração de Imagens com IA</Label>
              <p className="text-sm text-muted-foreground">
                Quero que as imagens do site sejam geradas com Inteligência Artificial
              </p>
            </div>
            <Switch
              checked={formData.aiGeneratedImages}
              onCheckedChange={(checked) => handleChange("aiGeneratedImages", checked)}
            />
          </div>

          {/* Upload de Imagens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Imagens do Produto/Serviço</Label>
              <span className="text-xs text-muted-foreground">Opcional</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Adicione imagens do produto, mockups, resultados ou equipe.
            </p>

            <div
              className={`border-2 border-dashed rounded-lg p-8 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <Label htmlFor="images-upload" className="cursor-pointer block">
                  <span className="text-lg font-medium text-primary hover:underline">
                    Clique para fazer upload
                  </span>
                  <span className="block text-sm text-muted-foreground mt-1">
                    ou arraste e solte seus arquivos aqui
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground mt-4">
                  PNG, JPG, WEBP até 5MB cada
                </p>
                <Input
                  id="images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-md text-sm">
                  <Icons.info className="h-4 w-4 flex-shrink-0" />
                  <p>
                    Defina onde cada imagem deve aparecer. <strong>Logo e Favicon são essenciais.</strong>
                  </p>
                </div>

                <div className="grid gap-4">
                  {formData.images.map((imageWithPos) => (
                    <div key={imageWithPos.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card animate-in fade-in slide-in-from-bottom-2">
                      {/* Preview da Imagem */}
                      <div className="relative group mx-auto sm:mx-0">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 border">
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
                          size="icon"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
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
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Informações e Controles */}
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium truncate" title={imageWithPos.file.name}>
                              {imageWithPos.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(imageWithPos.file.size / 1024)} KB
                            </p>
                          </div>

                          {/* Badge da Posição */}
                          <Badge variant={imageWithPos.position === 'unassigned' ? 'secondary' : 'default'} className="whitespace-nowrap">
                            {allImagePositions.find(p => p.value === imageWithPos.position)?.label || imageWithPos.position}
                          </Badge>
                        </div>

                        {/* Seletor de Posição */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Label className="text-xs text-muted-foreground whitespace-nowrap">Onde usar:</Label>
                          <Select
                            value={imageWithPos.position}
                            onValueChange={(value: any) =>
                              updateImagePosition(imageWithPos.id, value)
                            }
                          >
                            <SelectTrigger className="h-9 text-sm w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredPositions.map(position => (
                                <SelectItem key={position.value} value={position.value}>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span>{position.label}</span>
                                      {/* @ts-ignore */}
                                      {position.required && <Badge variant="outline" className="text-[10px] h-4 px-1">Obrigatório</Badge>}
                                    </div>
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
                        <div className="flex gap-2 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
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
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm font-medium mb-3">📊 Resumo das Posições:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
                    {filteredPositions.map(position => {
                      const count = formData.images.filter(img => img.position === position.value).length
                      const isRequired = (position.value === 'logo' || position.value === 'favicon')
                      const isMissing = isRequired && count === 0

                      return (
                        <div
                          key={position.value}
                          className={`flex flex-col items-center justify-center p-2 rounded border ${isMissing ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900" : "bg-background"
                            }`}
                        >
                          <div className={`font-bold text-lg ${isMissing ? "text-red-500" : ""}`}>{count}</div>
                          <div className="text-muted-foreground text-center leading-tight">{position.label}</div>
                          {isMissing && <span className="text-[10px] text-red-500 font-medium mt-1">Faltando</span>}
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