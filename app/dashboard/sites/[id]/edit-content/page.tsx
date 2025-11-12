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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

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
  { value: "logo", label: "🏷️ Logo", description: "Logo da empresa (formato PNG transparente recomendado)" },
  { value: "favicon", label: "🔖 Favicon", description: "Ícone do site (32x32px recomendado)" },
  { value: "hero", label: "🚀 Hero Principal", description: "Imagem de destaque na primeira seção" },
  { value: "about", label: "👥 Sobre Nós", description: "Foto da equipe ou empresa" },
  { value: "credibility", label: "🏆 Credibilidade", description: "Ambiente profissional ou certificações" },
  { value: "gallery", label: "🖼️ Galeria", description: "Produtos, resultados ou portfólio" },
  { value: "unassigned", label: "📋 Não Definido", description: "Disponível para uso geral" }
]

export default function EditProjectContent({ params }: Props) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
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

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchProject(resolvedParams.id)
    }
  }, [resolvedParams])

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) throw new Error('Projeto não encontrado')
      
      const projectData = await response.json()
      setProject(projectData)
      
      // Carregar conteúdo do briefing ou dados
      if (projectData.briefing) {
        setContent(projectData.briefing)
      } else if (projectData.data) {
        setContent({
          siteName: projectData.data.basicInfo?.siteName || '',
          slogan: projectData.data.basicInfo?.slogan || '',
          description: projectData.data.content?.description || '',
          targetAudience: projectData.data.content?.targetAudience || '',
          mainServices: '',
          contactInfo: '',
          brandColors: projectData.data.visualIdentity?.brandColors || '',
          style: projectData.data.visualIdentity?.style || '',
          additionalRequirements: ''
        })
      }
      
      // Tentar múltiplas fontes para as imagens
      const images = projectData.images || 
                   projectData.data?.additionalResources?.images || 
                   []
      
      console.log('🖼️ Imagens carregadas na edição de conteúdo:', images)
      setImages(images)
    } catch (error) {
      console.error('Erro ao buscar projeto:', error)
      toast.error("Erro ao carregar projeto")
      router.push('/dashboard/sites')
    } finally {
      setLoading(false)
    }
  }

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

    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Validar arquivo
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`)
          return null
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande (máx 5MB)`)
          return null
        }

        // Converter arquivo para base64 para upload
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        // Upload para MinIO via API
        const uploadResponse = await fetch(`/api/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: base64,
            projectId: resolvedParams.id,
            imageName: file.name.replace(/\.[^/.]+$/, '') // Remove extensão
          })
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Erro no upload')
        }

        const { url } = await uploadResponse.json()
        
        const newImage: ImageWithPosition = {
          url,
          position: targetPosition || 'unassigned',
          id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name
        }

        return newImage
      } catch (error) {
        console.error(`Erro ao fazer upload de ${file.name}:`, error)
        toast.error(`Erro ao enviar ${file.name}`)
        return null
      }
    })

    toast.promise(
      Promise.all(uploadPromises),
      {
        loading: `Enviando ${files.length} imagem(ns) para MinIO...`,
        success: (results) => {
          const validImages = results.filter(img => img !== null)
          if (validImages.length > 0) {
            setImages(prev => [...prev, ...validImages])
          }
          return `${validImages.length} imagem(ns) enviada(s) com sucesso!`
        },
        error: 'Erro ao enviar imagens'
      }
    )
  }

  const saveChanges = async () => {
    if (!resolvedParams?.id) return

    setSaving(true)
    try {
      // Salvar conteúdo
      const contentResponse = await fetch(`/api/projects/${resolvedParams.id}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      // Salvar imagens (já processadas e no MinIO)
      const imagesResponse = await fetch(`/api/projects/${resolvedParams.id}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images })
      })

      if (!contentResponse.ok) {
        const contentError = await contentResponse.text()
        console.error('Erro na API de conteúdo:', contentError)
        throw new Error(`Erro ao salvar conteúdo: ${contentResponse.status}`)
      }

      if (!imagesResponse.ok) {
        const imagesError = await imagesResponse.text()
        console.error('Erro na API de imagens:', imagesError)
        throw new Error(`Erro ao salvar imagens: ${imagesResponse.status}`)
      }

      toast.success("Alterações salvas com sucesso!")
      router.push(`/dashboard/sites`)
    } catch (error) {
      console.error('Erro ao salvar:', error)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projeto não encontrado</p>
        <Button onClick={() => router.push('/dashboard/sites')} className="mt-4">
          Voltar aos Projetos
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">Editar conteúdo e recursos visuais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <Icons.arrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={saveChanges} disabled={saving}>
            {saving ? <Icons.spinner className="h-4 w-4 animate-spin mr-2" /> : <Icons.save className="h-4 w-4 mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="branding">Identidade Visual</TabsTrigger>
          <TabsTrigger value="images">Imagens</TabsTrigger>
        </TabsList>

        {/* Conteúdo */}
        <TabsContent value="content">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Informações principais do site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Nome do Site</Label>
                  <Input
                    id="siteName"
                    value={content.siteName}
                    onChange={(e) => updateContent('siteName', e.target.value)}
                    placeholder="Ex: Minha Empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="slogan">Slogan/Headline</Label>
                  <Input
                    id="slogan"
                    value={content.slogan}
                    onChange={(e) => updateContent('slogan', e.target.value)}
                    placeholder="Ex: Transforme seu negócio"
                  />
                </div>
                <div>
                  <Label htmlFor="targetAudience">Público-Alvo</Label>
                  <Input
                    id="targetAudience"
                    value={content.targetAudience}
                    onChange={(e) => updateContent('targetAudience', e.target.value)}
                    placeholder="Ex: Pequenas empresas"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descrição e Serviços</CardTitle>
                <CardDescription>Conte mais sobre seu negócio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição da Empresa</Label>
                  <Textarea
                    id="description"
                    value={content.description}
                    onChange={(e) => updateContent('description', e.target.value)}
                    placeholder="Descreva sua empresa, missão e valores..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="mainServices">Principais Serviços</Label>
                  <Textarea
                    id="mainServices"
                    value={content.mainServices}
                    onChange={(e) => updateContent('mainServices', e.target.value)}
                    placeholder="Liste seus principais serviços ou produtos..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
                <CardDescription>Configurações extras e contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactInfo">Informações de Contato</Label>
                    <Textarea
                      id="contactInfo"
                      value={content.contactInfo}
                      onChange={(e) => updateContent('contactInfo', e.target.value)}
                      placeholder="Email, telefone, endereço..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="style">Estilo Desejado</Label>
                    <Input
                      id="style"
                      value={content.style}
                      onChange={(e) => updateContent('style', e.target.value)}
                      placeholder="Ex: Moderno, Minimalista, Corporativo"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="additionalRequirements">Requisitos Especiais</Label>
                  <Textarea
                    id="additionalRequirements"
                    value={content.additionalRequirements || ''}
                    onChange={(e) => updateContent('additionalRequirements', e.target.value)}
                    placeholder="Funcionalidades específicas, integrações, etc..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Identidade Visual */}
        <TabsContent value="branding">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.image className="h-5 w-5" />
                  Logo da Empresa
                </CardTitle>
                <CardDescription>
                  Upload do logo (PNG transparente recomendado)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getImagesByPosition('logo').length > 0 ? (
                    <div className="space-y-3">
                      {getImagesByPosition('logo').map((logo) => (
                        <div key={logo.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={logo.url}
                              alt="Logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{logo.filename}</p>
                            <Badge variant="default">Logo Atual</Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(logo.id)}
                          >
                            <Icons.trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Icons.upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <span className="text-primary hover:underline">
                            Clique para fazer upload do logo
                          </span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          PNG, SVG, JPG até 5MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => addNewImages(e.target.files, 'logo')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.globe className="h-5 w-5" />
                  Favicon
                </CardTitle>
                <CardDescription>
                  Ícone do site (32x32px ou 16x16px recomendado)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getImagesByPosition('favicon').length > 0 ? (
                    <div className="space-y-3">
                      {getImagesByPosition('favicon').map((favicon) => (
                        <div key={favicon.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-muted rounded overflow-hidden flex-shrink-0">
                            <img
                              src={favicon.url}
                              alt="Favicon"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{favicon.filename}</p>
                            <Badge variant="default">Favicon Atual</Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(favicon.id)}
                          >
                            <Icons.trash className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Icons.upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Label htmlFor="favicon-upload" className="cursor-pointer">
                          <span className="text-primary hover:underline">
                            Clique para fazer upload do favicon
                          </span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          ICO, PNG até 1MB (32x32px ideal)
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="favicon-upload"
                    type="file"
                    accept="image/*,.ico"
                    className="hidden"
                    onChange={(e) => addNewImages(e.target.files, 'favicon')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cores */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Paleta de Cores</CardTitle>
                <CardDescription>Cores da identidade visual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandColors">Cores da Marca</Label>
                    <Input
                      id="brandColors"
                      value={content.brandColors}
                      onChange={(e) => updateContent('brandColors', e.target.value)}
                      placeholder="Ex: #3B82F6, #1E40AF"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Códigos hex das cores principais, separados por vírgula
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Imagens */}
        <TabsContent value="images">
          <div className="grid gap-6">
            {/* Upload Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.upload className="h-5 w-5" />
                  Adicionar Imagens
                </CardTitle>
                <CardDescription>
                  Faça upload de imagens para o seu projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Icons.upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Label htmlFor="general-images" className="cursor-pointer">
                        <span className="text-primary hover:underline">
                          Clique para fazer upload
                        </span>
                        <span className="text-muted-foreground"> ou arraste e solte</span>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG até 5MB cada
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        💾 Imagens são enviadas automaticamente para o MinIO
                      </p>
                    <input
                      id="general-images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => addNewImages(e.target.files)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Imagens */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Imagens ({images.length})</CardTitle>
                <CardDescription>
                  Organize onde cada imagem deve aparecer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <div className="text-center py-8">
                    <Icons.image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma imagem adicionada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {images.map((image) => (
                      <div key={image.id} className="flex gap-4 p-4 border rounded-lg">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={image.url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{image.filename || 'Imagem'}</p>
                              <p className="text-xs text-muted-foreground">ID: {image.id}</p>
                            </div>
                            <Badge variant={image.position === 'unassigned' ? 'secondary' : 'default'}>
                              {imagePositions.find(p => p.value === image.position)?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Posição:</Label>
                            <Select
                              value={image.position}
                              onValueChange={(value: ImageWithPosition['position']) => 
                                updateImagePosition(image.id, value)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs max-w-xs">
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(image.url, '_blank')}
                            >
                              <Icons.eye className="h-3 w-3 mr-1" />
                              Visualizar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeImage(image.id)}
                            >
                              <Icons.trash className="h-3 w-3 mr-1" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resumo */}
                {images.length > 0 && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-3">📊 Distribuição das Imagens:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePositions.map(position => {
                        const count = images.filter(img => img.position === position.value).length
                        return (
                          <div key={position.value} className="text-center">
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-xs text-muted-foreground">{position.label}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
