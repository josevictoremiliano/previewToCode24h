"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface VisualIdentity {
  logoFile: File | null
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  style: string
  referenceUrls: string[]
}

interface Props {
  data: VisualIdentity
  onUpdate: (data: VisualIdentity) => void
  onNext: () => void
  onPrevious: () => void
}

const styles = [
  { value: "moderno", label: "Moderno", description: "Design limpo e contemporâneo" },
  { value: "minimalista", label: "Minimalista", description: "Simples e direto ao ponto" },
  { value: "classico", label: "Clássico", description: "Elegante e tradicional" },
  { value: "bold", label: "Bold", description: "Chamativo e impactante" },
  { value: "criativo", label: "Criativo", description: "Único e artístico" },
]

export function IdentidadeVisual({ data, onUpdate, onNext, onPrevious }: Props) {
  const [formData, setFormData] = useState<VisualIdentity>(data)
  const [referenceInput, setReferenceInput] = useState("")

  const handleChange = (field: keyof VisualIdentity, value: string | File | null | string[]) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onUpdate(newData)
  }

  const addReferenceUrl = () => {
    if (referenceInput.trim()) {
      const urls = [...formData.referenceUrls, referenceInput.trim()]
      handleChange("referenceUrls", urls)
      setReferenceInput("")
    }
  }

  const removeReferenceUrl = (index: number) => {
    const urls = formData.referenceUrls.filter((_, i) => i !== index)
    handleChange("referenceUrls", urls)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.eye className="h-5 w-5" />
          Identidade Visual
        </CardTitle>
        <CardDescription>
          Defina a aparência visual do seu site
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cores */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Estilo */}
          <div className="space-y-3">
            <Label>Estilo Desejado</Label>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {styles.map((style) => (
                <Card
                  key={style.value}
                  className={`cursor-pointer transition-colors ${formData.style === style.value
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                    }`}
                  onClick={() => handleChange("style", style.value)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium">{style.label}</h4>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* URLs de Referência */}
          <div className="space-y-3">
            <Label>Sites de Referência (Opcional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://exemplo.com"
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addReferenceUrl())}
              />
              <Button type="button" onClick={addReferenceUrl} disabled={!referenceInput.trim()}>
                <Icons.plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.referenceUrls.length > 0 && (
              <div className="space-y-2">
                {formData.referenceUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Icons.externalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReferenceUrl(index)}
                    >
                      <Icons.x className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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