"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface PromptTemplate {
  id: string
  name: string
  key: string
  category: string
  description?: string
  isActive: boolean
  variables: string[]
  prompt: string
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  _count: {
    usageLogs: number
  }
}

interface PromptsTabProps {
  prompts: PromptTemplate[]
  onPromptsChange: (prompts: PromptTemplate[]) => void
  onReload: () => void
  onInitializeDefaults: () => void
}

const categories = [
  { value: 'copywriting', label: 'Copywriting' },
  { value: 'development', label: 'Desenvolvimento' },
  { value: 'seo', label: 'SEO' },
  { value: 'design', label: 'Design' },
  { value: 'general', label: 'Geral' }
]

export function PromptsTab({ prompts, onPromptsChange, onReload, onInitializeDefaults }: PromptsTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)
  const [isToggling, setIsToggling] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    prompt: '',
    description: '',
    category: 'general',
    variables: '',
    isActive: true
  })

  const filteredPrompts = selectedCategory === 'all'
    ? prompts
    : prompts.filter(p => p.category === selectedCategory)

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      prompt: '',
      description: '',
      category: 'general',
      variables: '',
      isActive: true
    })
    setEditingPrompt(null)
    setShowForm(false)
  }

  const handleEdit = (prompt: PromptTemplate) => {
    setEditingPrompt(prompt)
    setFormData({
      name: prompt.name,
      key: prompt.key,
      prompt: prompt.prompt,
      description: prompt.description || '',
      category: prompt.category,
      variables: prompt.variables.join(', '),
      isActive: prompt.isActive
    })
    setShowForm(true)
  }

  const handleToggleActive = async (prompt: PromptTemplate) => {
    setIsToggling(prompt.id)

    try {
      const response = await fetch(`/api/admin/ai/prompts/${prompt.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao alterar status do template')
      }

      const updatedPrompt = await response.json()
      const updatedPrompts = prompts.map(p =>
        p.id === prompt.id ? updatedPrompt : p
      )
      onPromptsChange(updatedPrompts)

      toast.success(`Template ${updatedPrompt.isActive ? 'ativado' : 'desativado'} com sucesso!`)
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar status')
    } finally {
      setIsToggling(null)
    }
  }

  const handleDelete = async (prompt: PromptTemplate) => {
    if (!confirm(`Tem certeza que deseja excluir o template "${prompt.name}"?`)) {
      return
    }

    setIsDeleting(prompt.id)

    try {
      const response = await fetch(`/api/admin/ai/prompts/${prompt.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir template')
      }

      const updatedPrompts = prompts.filter(p => p.id !== prompt.id)
      onPromptsChange(updatedPrompts)

      toast.success('Template excluído com sucesso!')
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir template')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Processar variáveis (separadas por vírgula)
      const variablesArray = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0)

      const payload = {
        ...formData,
        variables: variablesArray
      }

      const url = editingPrompt
        ? `/api/admin/ai/prompts/${editingPrompt.id}`
        : '/api/admin/ai/prompts'

      const method = editingPrompt ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Erro ao ${editingPrompt ? 'atualizar' : 'criar'} template`)
      }

      const updatedPrompt = await response.json()

      if (editingPrompt) {
        // Atualizar template existente
        const updatedPrompts = prompts.map(prompt =>
          prompt.id === editingPrompt.id ? updatedPrompt : prompt
        )
        onPromptsChange(updatedPrompts)
        toast.success('Template atualizado com sucesso!')
      } else {
        // Adicionar novo template
        onPromptsChange([updatedPrompt, ...prompts])
        toast.success('Template criado com sucesso!')
      }

      resetForm()
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Templates de Prompt</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os templates de prompt para geração de conteúdo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onInitializeDefaults}>
            <Icons.download className="mr-2 h-4 w-4" />
            Prompts Padrão
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Icons.plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPrompt ? 'Editar Template de Prompt' : 'Novo Template de Prompt'}
            </CardTitle>
            <CardDescription>
              {editingPrompt ? 'Edite o template de prompt selecionado' : 'Crie um novo template de prompt para geração de conteúdo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        name,
                        key: generateKey(name)
                      }))
                    }}
                    placeholder="Ex: Criação de copy"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key">Chave Única</Label>
                  <Input
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="Ex: copy_creation"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variables">Variáveis</Label>
                  <Input
                    value={formData.variables}
                    onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                    placeholder="nomeSite, email, cores (separadas por vírgula)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {`{{ variavel }}`} no prompt para substituir valores
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do que este template faz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Você é um assistente especializado em..."
                  rows={8}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Template Ativo</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      {editingPrompt ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      <Icons.save className="mr-2 h-4 w-4" />
                      {editingPrompt ? 'Atualizar Template' : 'Criar Template'}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Templates */}
      <div className="grid gap-4">
        {filteredPrompts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Icons.fileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {prompts.length === 0 ? 'Nenhum template encontrado' : 'Nenhum template nesta categoria'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {prompts.length === 0
                  ? 'Crie seu primeiro template ou inicialize os padrão'
                  : 'Tente uma categoria diferente ou crie um novo template'
                }
              </p>
              {prompts.length === 0 && (
                <div className="flex gap-2">
                  <Button onClick={onInitializeDefaults} variant="outline">
                    <Icons.download className="mr-2 h-4 w-4" />
                    Prompts Padrão
                  </Button>
                  <Button onClick={() => setShowForm(true)}>
                    <Icons.plus className="mr-2 h-4 w-4" />
                    Novo Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPrompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{prompt.name}</CardTitle>
                      <Badge variant="outline">
                        {categories.find(c => c.value === prompt.category)?.label || prompt.category}
                      </Badge>
                      {prompt.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {prompt.description || 'Sem descrição'}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Chave: <code className="bg-muted px-1 rounded">{prompt.key}</code></span>
                      {prompt.variables.length > 0 && (
                        <span>
                          Variáveis: {prompt.variables.map(v => (
                            <code key={v} className="bg-muted px-1 rounded mr-1">{`{{ ${v} }}`}</code>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedPrompt(
                        expandedPrompt === prompt.id ? null : prompt.id
                      )}
                    >
                      {expandedPrompt === prompt.id ? (
                        <>
                          <Icons.chevronUp className="mr-2 h-4 w-4" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Icons.chevronDown className="mr-2 h-4 w-4" />
                          Ver Prompt
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prompt)}
                      disabled={isSubmitting}
                    >
                      <Icons.edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(prompt)}
                      disabled={isToggling === prompt.id}
                      className={prompt.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {isToggling === prompt.id ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          {prompt.isActive ? 'Desativando...' : 'Ativando...'}
                        </>
                      ) : (
                        <>
                          {prompt.isActive ? (
                            <>
                              <Icons.pauseCircle className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Icons.playCircle className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prompt)}
                      disabled={isDeleting === prompt.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isDeleting === prompt.id ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <Icons.trash className="mr-2 h-4 w-4" />
                          Excluir
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium">Usos:</span>
                    <br />
                    {prompt._count?.usageLogs || 0}
                  </div>
                  <div>
                    <span className="font-medium">Variáveis:</span>
                    <br />
                    {prompt.variables.length}
                  </div>
                  <div>
                    <span className="font-medium">Criado por:</span>
                    <br />
                    {prompt.createdBy.name}
                  </div>
                  <div>
                    <span className="font-medium">Criado em:</span>
                    <br />
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {expandedPrompt === prompt.id && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">Prompt:</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {prompt.prompt}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}