"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"

// Tipos locais
interface FormData {
  basicInfo: {
    siteName: string
    slogan: string
    siteType: string
    niche: string
  }
  visualIdentity: {
    logoFile: File | null
    logoUrl: string
    primaryColor: string
    secondaryColor: string
    style: string
    referenceUrls: string[]
  }
  content: {
    description: string
    targetAudience: string
    products: string[]
    cta: string
    sections: string[]
  }
  contact: {
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
  additionalResources: {
    images: File[]
    customTexts: string
    features: string[]
  }
}

interface Props {
  data: FormData
  onSubmit: () => void
  onPrevious: () => void
  isSubmitting: boolean
}

export function Revisao({ data, onSubmit, onPrevious, isSubmitting }: Props) {
  const getSectionLabel = (sectionId: string) => {
    const sections: Record<string, string> = {
      "sobre": "Sobre",
      "servicos": "Serviços", 
      "portfolio": "Portfólio",
      "depoimentos": "Depoimentos",
      "contato": "Contato",
      "blog": "Blog",
      "faq": "FAQ",
      "equipe": "Equipe"
    }
    return sections[sectionId] || sectionId
  }

  const getFeatureLabel = (featureId: string) => {
    const features: Record<string, string> = {
      "contact-form": "Formulário de Contato",
      "whatsapp-chat": "Chat WhatsApp",
      "newsletter": "Newsletter",
      "testimonials": "Depoimentos",
      "gallery": "Galeria de Imagens",
      "blog": "Blog/Notícias",
      "maps": "Mapa de Localização",
      "social-feed": "Feed Social"
    }
    return features[featureId] || featureId
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.checkCircle className="h-5 w-5" />
          Revisão Final
        </CardTitle>
        <CardDescription>
          Confirme todas as informações antes de criar seu site
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome do Site:</span>
                <span className="font-medium">{data.basicInfo.siteName}</span>
              </div>
              {data.basicInfo.slogan && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slogan:</span>
                  <span className="font-medium">{data.basicInfo.slogan}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de Site:</span>
                <Badge variant="secondary">{data.basicInfo.siteType}</Badge>
              </div>
              {data.basicInfo.niche && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nicho:</span>
                  <Badge variant="outline">{data.basicInfo.niche}</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Identidade Visual */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Identidade Visual</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cor Primária:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: data.visualIdentity.primaryColor }}
                  />
                  <span className="font-mono text-xs">{data.visualIdentity.primaryColor}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cor Secundária:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: data.visualIdentity.secondaryColor }}
                  />
                  <span className="font-mono text-xs">{data.visualIdentity.secondaryColor}</span>
                </div>
              </div>
              {data.visualIdentity.style && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estilo:</span>
                  <Badge variant="secondary">{data.visualIdentity.style}</Badge>
                </div>
              )}
              {data.visualIdentity.logoFile && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Logo:</span>
                  <span className="font-medium">✓ Arquivo enviado</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Conteúdo */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Conteúdo</h3>
            <div className="space-y-2 text-sm">
              {data.content.description && (
                <div>
                  <span className="text-muted-foreground">Descrição:</span>
                  <p className="mt-1 text-sm bg-muted p-2 rounded">
                    {data.content.description.substring(0, 150)}
                    {data.content.description.length > 150 ? "..." : ""}
                  </p>
                </div>
              )}
              
              {data.content.targetAudience && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Público-alvo:</span>
                  <span className="font-medium">{data.content.targetAudience}</span>
                </div>
              )}

              {data.content.products.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Produtos/Serviços:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {data.content.products.map((product, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.content.cta && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Call-to-Action:</span>
                  <Badge>{data.content.cta}</Badge>
                </div>
              )}

              {data.content.sections.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Seções:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {data.content.sections.map((section, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {getSectionLabel(section)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contato */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Informações de Contato</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{data.contact.email}</span>
              </div>
              {data.contact.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium">{data.contact.phone}</span>
                </div>
              )}
              {data.contact.address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-medium">{data.contact.address}</span>
                </div>
              )}
              
              {/* Redes Sociais */}
              {Object.entries(data.contact.socialMedia).some(([, value]) => value) && (
                <div>
                  <span className="text-muted-foreground">Redes Sociais:</span>
                  <div className="mt-1 space-y-1">
                    {Object.entries(data.contact.socialMedia).map(([platform, value]) => 
                      value && (
                        <div key={platform} className="flex justify-between text-xs">
                          <span className="capitalize">{platform}:</span>
                          <span>{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Recursos Adicionais */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Recursos Adicionais</h3>
            <div className="space-y-2 text-sm">
              {data.additionalResources.images.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Imagens:</span>
                  <span className="font-medium">{data.additionalResources.images.length} arquivo(s)</span>
                </div>
              )}
              
              {data.additionalResources.customTexts && (
                <div>
                  <span className="text-muted-foreground">Textos Personalizados:</span>
                  <p className="mt-1 text-sm bg-muted p-2 rounded">
                    {data.additionalResources.customTexts.substring(0, 100)}
                    {data.additionalResources.customTexts.length > 100 ? "..." : ""}
                  </p>
                </div>
              )}

              {data.additionalResources.features.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Funcionalidades:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {data.additionalResources.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {getFeatureLabel(feature)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Termos e Condições */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox id="terms" required />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Li e concordo com os termos de uso
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ao confirmar, você concorda que processaremos suas informações para criar seu site personalizado.
                  Você receberá um preview em até 12 horas e o site final em até 24 horas.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onPrevious} disabled={isSubmitting}>
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Criando Site...
                </>
              ) : (
                <>
                  <Icons.checkCircle className="mr-2 h-4 w-4" />
                  Confirmar e Criar Site
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}