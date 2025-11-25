"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { FileText, Palette, Image as ImageIcon, Save, ArrowLeft, Upload, Trash, Eye, Check, Layout, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"

interface ImageWithPosition {
  url: string
  position: 'hero' | 'about' | 'credibility' | 'gallery' | 'logo' | 'favicon' | 'unassigned'
  id: string
  filename?: string
}

interface ProjectContent {
  siteName: string
  slogan: string
  description: string
  targetAudience: string
  mainServices: string
  contactInfo: string
  brandColors: string
  style: string
  additionalRequirements?: string
}

interface Project {
  id: string
  name: string
  briefing?: ProjectContent
  data: {
    visualIdentity?: {
      logoUrl?: string
      primaryColor?: string
      secondaryColor?: string
      referenceUrls?: string[]
    }
    additionalResources?: {
      images?: ImageWithPosition[]
    }
    basicInfo?: {
      siteName?: string
      slogan?: string
    }
    content?: {
      description?: string
      targetAudience?: string
    }
  }
}

interface Props {
  params: Promise<{ id: string }>
}

const imagePositions = [
  { value: "logo", label: "Logo", description: "Logo da empresa", icon: "🏷️" },
  { value: "favicon", label: "Favicon", description: "Ícone do site", icon: "🔖" },
  { value: "hero", label: "Hero Principal", description: "Destaque inicial", icon: "🚀" },
  { value: "about", label: "Sobre Nós", description: "Foto da equipe", icon: "👥" },
  { value: "credibility", label: "Credibilidade", description: "Certificações", icon: "🏆" },
  { value: "gallery", label: "Galeria", description: "Portfólio/Produtos", icon: "🖼️" },
  { value: "unassigned", label: "Geral", description: "Uso livre", icon: "📋" }
]

export default function EditProjectContent({ params }: Props) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'content' | 'branding' | 'images'>('content')
  const [project, setProject] = useState<Project | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [content, setContent] = useState<ProjectContent>({
    siteName: '',
    slogan: '',
    description: '',
    targetAudience: '',
    mainServices: '',
    contactInfo: '',
    brandColors: '',
    style: '',
    additionalRequirements: ''
  })
  const [images, setImages] = useState<ImageWithPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) throw new Error('Projeto não encontrado')

      const projectData = await response.json()
      setProject(projectData)

      if (projectData.briefing) {
        setContent(projectData.briefing)
      } else if (projectData.data) {
        setContent({
          siteName: projectData.data.basicInfo?.siteName || '',
          slogan: projectData.data.basicInfo?.slogan || '',
          description: projectData.data.content?.description || '',
          targetAudience: projectData.data.content?.targetAudience || '',
          mainServices: projectData.data.content?.mainServices || projectData.data.basicInfo?.mainServices || '',
          contactInfo: projectData.data.basicInfo?.contactInfo || projectData.data.content?.contactInfo || '',
          brandColors: projectData.data.visualIdentity?.brandColors ||
            (projectData.data.visualIdentity?.primaryColor ?
              `${projectData.data.visualIdentity.primaryColor}${projectData.data.visualIdentity.secondaryColor ? `, ${projectData.data.visualIdentity.secondaryColor}` : ''}`
              : ''),
          style: projectData.data.visualIdentity?.style || '',
          additionalRequirements: projectData.data.content?.additionalRequirements || ''
        })
      }

      let images: ImageWithPosition[] = []
      const rawImages = projectData.images || projectData.data?.additionalResources?.images || []

      // Normalize images
      if (Array.isArray(rawImages)) {
        images = rawImages.map((img: any, index: number) => {
          if (typeof img === 'string') {
            return {
              id: `legacy-${index}`,
              url: img,
              position: 'unassigned',
              filename: `Imagem ${index + 1}`
            }
          }
          return img
        })
      }

      // Sync Logo
      if (projectData.data?.visualIdentity?.logoUrl) {
        const logoUrl = projectData.data.visualIdentity.logoUrl
        if (logoUrl && !logoUrl.startsWith('blob:') && !logoUrl.startsWith('data:')) {
          const hasLogo = images.some(img => img.position === 'logo')
          if (!hasLogo) {
            images.unshift({
              id: 'logo-from-identity',
              url: logoUrl,
              position: 'logo',
              filename: 'Logo Atual'
            })
          } else {
            // Update existing logo if it's a blob
            images = images.map(img => {
              if (img.position === 'logo' && (img.url.startsWith('blob:') || img.url.startsWith('data:'))) {
                return { ...img, url: logoUrl }
              }
              return img
            })
          }
        }
      }

      console.log('Processed images:', images)
      setImages(images)
    } catch (error) {
      console.error('Erro ao buscar projeto:', error)
      toast.error("Erro ao carregar projeto")
      router.push('/dashboard/sites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchProject(resolvedParams.id)
    }
  }, [resolvedParams])
  const updateContent = (field: keyof ProjectContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }))
  }

  const updateImagePosition = (id: string, position: ImageWithPosition['position']) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, position } : img
    ))
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    toast.success("Imagem removida!")
  }

  const addNewImages = async (files: FileList | null, targetPosition?: ImageWithPosition['position']) => {
    if (!files || !resolvedParams?.id) return

    const loadingToast = toast.loading(`Enviando ${files.length} imagem(ns)...`)

    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        if (!file.type.startsWith('image/')) return null
        if (file.size > 5 * 1024 * 1024) return null

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        const uploadResponse = await fetch(`/api/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: base64,
            projectId: resolvedParams.id,
            imageName: file.name.replace(/\.[^/.]+$/, '')
          })
        })

        if (!uploadResponse.ok) throw new Error('Erro no upload')

        const { url } = await uploadResponse.json()

        return {
          url,
          position: targetPosition || 'unassigned',
          id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name
        } as ImageWithPosition
      } catch (error) {
        console.error(error)
        return null
      }
    })

    try {
      const results = await Promise.all(uploadPromises)
      const validImages = results.filter((img): img is ImageWithPosition => img !== null)

      if (validImages.length > 0) {
        setImages(prev => [...prev, ...validImages])
        toast.success(`${validImages.length} imagem(ns) enviada(s)!`, { id: loadingToast })
      } else {
        toast.error("Falha ao enviar imagens", { id: loadingToast })
      }
    } catch (error) {
      toast.error("Erro ao processar imagens", { id: loadingToast })
    }
  }

  const saveChanges = async () => {
    if (!resolvedParams?.id) return

    setSaving(true)
    try {
      // Extract logo URL from images
      const logoImage = images.find(img => img.position === 'logo')
      const logoUrl = logoImage ? logoImage.url : undefined

      // Prepare content payload with logoUrl
      const contentPayload = { ...content, logoUrl }

      await Promise.all([
        fetch(`/api/projects/${resolvedParams.id}/content`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: contentPayload })
        }),
        fetch(`/api/projects/${resolvedParams.id}/images`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images })
        })
      ])

      toast.success("Alterações salvas com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
  }

  const getImagesByPosition = (position: ImageWithPosition['position']) => {
    return images.filter(img => img.position === position)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando conteúdo...</p>
        </div>
      </div>
    )
  }

  if (!project) return null

  const navItems = [
    { id: 'content', label: 'Conteúdo Textual', icon: FileText, description: 'Textos e informações básicas' },
    { id: 'branding', label: 'Identidade Visual', icon: Palette, description: 'Logo, cores e estilo' },
    { id: 'images', label: 'Galeria de Imagens', icon: ImageIcon, description: 'Gerenciamento de mídia' },
  ] as const

  return (
    <div className="max-w-7xl mx-auto pb-10" >
      {/* Header */}
      < div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8" >
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">Gerenciamento de conteúdo e mídia</p>
          </div>
        </div>
        <Button onClick={saveChanges} disabled={saving} size="lg" className="shadow-sm">
          {saving ? <Icons.spinner className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Alterações
        </Button>
      </div >

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                activeSection === item.id ? "bg-primary-foreground/10" : "bg-background border"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className={cn(
                  "text-xs",
                  activeSection === item.id ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {activeSection === 'content' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Informações Principais</CardTitle>
                  <CardDescription>Dados essenciais para o desenvolvimento do site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nome do Site</Label>
                      <Input
                        value={content.siteName}
                        onChange={(e) => updateContent('siteName', e.target.value)}
                        placeholder="Ex: TechSolutions"
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slogan / Headline</Label>
                      <Input
                        value={content.slogan}
                        onChange={(e) => updateContent('slogan', e.target.value)}
                        placeholder="Ex: Inovação para o seu futuro"
                        className="bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição do Negócio</Label>
                    <Textarea
                      value={content.description}
                      onChange={(e) => updateContent('description', e.target.value)}
                      placeholder="Descreva detalhadamente o que sua empresa faz..."
                      className="min-h-[120px] bg-muted/30 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Detalhes Específicos</CardTitle>
                  <CardDescription>Informações para direcionar o conteúdo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Público-Alvo</Label>
                      <Input
                        value={content.targetAudience}
                        onChange={(e) => updateContent('targetAudience', e.target.value)}
                        placeholder="Quem são seus clientes ideais?"
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estilo Desejado</Label>
                      <Input
                        value={content.style}
                        onChange={(e) => updateContent('style', e.target.value)}
                        placeholder="Ex: Minimalista, Corporativo, Criativo"
                        className="bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Principais Serviços/Produtos</Label>
                    <Textarea
                      value={content.mainServices}
                      onChange={(e) => updateContent('mainServices', e.target.value)}
                      placeholder="Liste o que você oferece..."
                      className="min-h-[100px] bg-muted/30 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Informações de Contato</Label>
                    <Textarea
                      value={content.contactInfo}
                      onChange={(e) => updateContent('contactInfo', e.target.value)}
                      placeholder="Endereço, telefones, emails, redes sociais..."
                      className="min-h-[80px] bg-muted/30 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'branding' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Logo</CardTitle>
                    <CardDescription>Formato PNG transparente (Recomendado)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getImagesByPosition('logo').length > 0 ? (
                        getImagesByPosition('logo').map((logo) => (
                          <div key={logo.id} className="relative group border rounded-xl p-4 bg-muted/10">
                            <div className="aspect-video flex items-center justify-center mb-3 cursor-pointer" onClick={() => setPreviewImage(logo.url)}>
                              <img src={logo.url} alt="Logo" className="max-h-24 object-contain hover:scale-105 transition-transform" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">Logo Atual</Badge>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeImage(logo.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium">Clique para enviar logo</span>
                          <span className="text-xs text-muted-foreground mt-1">PNG, SVG até 5MB</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => addNewImages(e.target.files, 'logo')} />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Favicon</CardTitle>
                    <CardDescription>Ícone do navegador (32x32px)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getImagesByPosition('favicon').length > 0 ? (
                        getImagesByPosition('favicon').map((favicon) => (
                          <div key={favicon.id} className="relative group border rounded-xl p-4 bg-muted/10">
                            <div className="aspect-video flex items-center justify-center mb-3 cursor-pointer" onClick={() => setPreviewImage(favicon.url)}>
                              <img src={favicon.url} alt="Favicon" className="w-8 h-8 object-contain hover:scale-105 transition-transform" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">Favicon Atual</Badge>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeImage(favicon.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium">Clique para enviar favicon</span>
                          <span className="text-xs text-muted-foreground mt-1">ICO, PNG até 1MB</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => addNewImages(e.target.files, 'favicon')} />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Cores da Marca</CardTitle>
                  <CardDescription>Defina as cores principais da sua identidade visual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label>Códigos Hexadecimais</Label>
                    <div className="flex gap-4">
                      <Input
                        value={content.brandColors}
                        onChange={(e) => updateContent('brandColors', e.target.value)}
                        placeholder="#000000, #FFFFFF"
                        className="font-mono"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {content.brandColors.split(',').map((color, i) => {
                        const c = color.trim()
                        return c.startsWith('#') && c.length >= 4 ? (
                          <div key={i} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg border">
                            <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: c }} />
                            <span className="text-xs font-mono">{c}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'images' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-sm bg-primary/5 border-primary/10">
                <CardContent className="pt-6">
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
                    <div className="bg-primary/10 p-3 rounded-full mb-3">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-medium text-primary">Clique para adicionar novas imagens</span>
                    <span className="text-xs text-muted-foreground mt-1">Suporta múltiplos arquivos (JPG, PNG)</span>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => addNewImages(e.target.files)} />
                  </label>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 gap-4">
                {images.filter(img => !['logo', 'favicon'].includes(img.position)).map((image) => (
                  <Card key={image.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                    <div className="relative aspect-video bg-muted cursor-pointer" onClick={() => setPreviewImage(image.url)}>
                      <img src={image.url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setPreviewImage(image.url); }}>
                          <Eye className="h-4 w-4 mr-2" /> Ver
                        </Button>
                        <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}>
                          <Trash className="h-4 w-4 mr-2" /> Remover
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-[150px]">{image.filename}</span>
                        <Badge variant="outline" className="font-normal">
                          {imagePositions.find(p => p.value === image.position)?.icon}
                        </Badge>
                      </div>
                      <Select
                        value={image.position}
                        onValueChange={(value: ImageWithPosition['position']) => updateImagePosition(image.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Definir posição" />
                        </SelectTrigger>
                        <SelectContent>
                          {imagePositions.filter(p => !['logo', 'favicon'].includes(p.value)).map(pos => (
                            <SelectItem key={pos.value} value={pos.value}>
                              <span className="mr-2">{pos.icon}</span>
                              {pos.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {images.filter(img => !['logo', 'favicon'].includes(img.position)).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma imagem na galeria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Visualização da Imagem</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  )
}
