"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface Contact {
  email: string
  phone: string
  address: string
  socialMedia: {
    instagram: string
    facebook: string
    linkedin: string
    twitter: string
    whatsapp: string
  }
}

interface Props {
  data: Contact
  onUpdate: (data: Contact) => void
  onNext: () => void
  onPrevious: () => void
}

export function Contato({ data, onUpdate, onNext, onPrevious }: Props) {
  const [formData, setFormData] = useState<Contact>(data)

  const handleChange = (field: keyof Contact | string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      const newData = {
        ...formData,
        [parent]: {
          ...(formData[parent as keyof Contact] as any),
          [child]: value
        }
      }
      setFormData(newData)
      onUpdate(newData)
    } else {
      const newData = { ...formData, [field]: value }
      setFormData(newData)
      onUpdate(newData)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      toast.error("Email é obrigatório")
      return
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Email inválido")
      return
    }

    onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.mail className="h-5 w-5" />
          Informações de Contato
        </CardTitle>
        <CardDescription>
          Como seus clientes podem entrar em contato
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone/WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço (Opcional)</Label>
            <Textarea
              id="address"
              placeholder="Rua, número, bairro, cidade - UF"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <Label>Redes Sociais (Opcional)</Label>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Icons.heart className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="@seuusuario ou URL completa"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleChange("socialMedia.instagram", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Icons.user className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="facebook.com/suapagina"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleChange("socialMedia.facebook", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Icons.user className="h-4 w-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="linkedin.com/company/empresa"
                  value={formData.socialMedia.linkedin}
                  onChange={(e) => handleChange("socialMedia.linkedin", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Icons.share className="h-4 w-4" />
                  Twitter/X
                </Label>
                <Input
                  id="twitter"
                  placeholder="@seuusuario"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleChange("socialMedia.twitter", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Icons.user className="h-4 w-4" />
                WhatsApp Business
              </Label>
              <Input
                id="whatsapp"
                placeholder="(11) 99999-9999"
                value={formData.socialMedia.whatsapp}
                onChange={(e) => handleChange("socialMedia.whatsapp", e.target.value)}
              />
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