"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface ImageWithPosition {
  url: string
  position: 'hero' | 'about' | 'credibility' | 'gallery' | 'unassigned'
  id: string
  filename?: string
}

interface Project {
  id: string
  name: string
  data: {
    visualIdentity?: {
      logoUrl?: string
      primaryColor?: string
      secondaryColor?: string
    }
    additionalResources?: {
      images?: ImageWithPosition[]
    }
  }
}

interface Props {
  params: Promise<{ id: string }>
}

const imagePositions = [
  { value: "hero", label: "🚀 Hero Principal", description: "Imagem de destaque na primeira seção" },
  { value: "about", label: "👥 Sobre Nós", description: "Foto da equipe ou empresa" },
  { value: "credibility", label: "🏆 Credibilidade", description: "Ambiente profissional ou certificações" },
  { value: "gallery", label: "🖼️ Galeria", description: "Produtos, resultados ou portfólio" },
  { value: "unassigned", label: "📋 Não Definido", description: "Disponível para uso geral" }
]

export default function EditProjectImages({ params }: Props) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
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
      
      // Tentar múltiplas fontes para as imagens
      const images = projectData.images || 
                   projectData.data?.additionalResources?.images || 
                   []
      
      console.log('🖼️ Imagens carregadas:', images)
      setImages(images)
    } catch (error) {
      console.error('Erro ao buscar projeto:', error)
      toast.error("Erro ao carregar projeto")
      router.push('/dashboard/sites')
    } finally {
      setLoading(false)
    }
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

  const addNewImages = async (files: FileList | null) => {
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
          position: 'unassigned',
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
      const response = await fetch(`/api/projects/${resolvedParams.id}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images })
      })

      if (!response.ok) throw new Error('Erro ao salvar alterações')

      toast.success("Alterações salvas com sucesso!")
      router.push(`/dashboard/sites/${resolvedParams.id}`)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error("Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">Gerenciar imagens e posicionamento</p>
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

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.upload className="h-5 w-5" />
            Adicionar Novas Imagens
          </CardTitle>
          <CardDescription>
            Faça upload de novas imagens para o seu projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Icons.upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <Label htmlFor="new-images" className="cursor-pointer">
                <span className="text-primary hover:underline">
                  Clique para fazer upload
                </span>
                <span className="text-muted-foreground"> ou arraste e solte</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                PNG, JPG até 5MB cada
              </p>
              <input
                id="new-images"
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

      {/* Images Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.image className="h-5 w-5" />
            Gerenciar Imagens ({images.length})
          </CardTitle>
          <CardDescription>
            Defina onde cada imagem deve aparecer no site
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
                  {/* Preview */}
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info and Controls */}
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

                    {/* Position Selector */}
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

                    {/* Actions */}
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

          {/* Summary */}
          {images.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-3">📊 Distribuição das Imagens:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
  )
}