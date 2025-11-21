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

interface AiConfig {
  id: string
  provider: string
  model: string
  maxTokens: number
  temperature: number
  description?: string
  isActive: boolean
  hasApiKey: boolean
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  _count: {
    usageLogs: number
  }
}

interface ConfigTabProps {
  configs: AiConfig[]
  onConfigsChange: (configs: AiConfig[]) => void
  onReload: () => void
}

export function ConfigTab({ configs, onConfigsChange, onReload }: ConfigTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState<string | null>(null)
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AiConfig | null>(null)
  const [isToggling, setIsToggling] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    provider: 'groq',
    apiKey: '',
    model: '',
    maxTokens: 4000,
    temperature: 0.7,
    description: '',
    isActive: true
  })

  const groqModels = [
    'llama3-8b-8192',
    'llama3-70b-8192',
    'mixtral-8x7b-32768',
    'gemma-7b-it',
    'gemma2-9b-it',
    'outros'
  ]

  const v0Models = [
    'v0-1',
    'v0-2',
    'outros'
  ]

  const resetForm = () => {
    setFormData({
      provider: 'groq',
      apiKey: '',
      model: '',
      maxTokens: 4000,
      temperature: 0.7,
      description: '',
      isActive: true
    })
    setIsCustomModel(false)
    setEditingConfig(null)
    setShowForm(false)
  }

  const handleEdit = (config: AiConfig) => {
    setEditingConfig(config)
    setFormData({
      provider: config.provider,
      apiKey: '', // Por segurança, não mostrar a chave
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      description: config.description || '',
      isActive: config.isActive
    })
    const isGroqModel = groqModels.includes(config.model)
    const isV0Model = v0Models.includes(config.model)
    setIsCustomModel(!(isGroqModel || isV0Model))
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingConfig 
        ? `/api/admin/ai/config/${editingConfig.id}` 
        : '/api/admin/ai/config'
      
      const method = editingConfig ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Erro ao ${editingConfig ? 'atualizar' : 'criar'} configuração`)
      }

      const updatedConfig = await response.json()
      
      if (editingConfig) {
        // Atualizar configuração existente
        const updatedConfigs = configs.map(config => 
          config.id === editingConfig.id ? updatedConfig : config
        )
        onConfigsChange(updatedConfigs)
        toast.success('Configuração atualizada com sucesso!')
      } else {
        // Adicionar nova configuração
        onConfigsChange([updatedConfig, ...configs])
        toast.success('Configuração criada com sucesso!')
      }
      
      resetForm()
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (config: AiConfig) => {
    setIsToggling(config.id)

    try {
      const response = await fetch(`/api/admin/ai/config/${config.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao alterar status da configuração')
      }

      const updatedConfig = await response.json()
      const updatedConfigs = configs.map(c => 
        c.id === config.id ? updatedConfig : c
      )
      onConfigsChange(updatedConfigs)
      
      toast.success(`Configuração ${updatedConfig.isActive ? 'ativada' : 'desativada'} com sucesso!`)
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar status')
    } finally {
      setIsToggling(null)
    }
  }

  const handleDelete = async (config: AiConfig) => {
    if (!confirm(`Tem certeza que deseja excluir a configuração "${config.provider.toUpperCase()} - ${config.model}"?`)) {
      return
    }

    setIsDeleting(config.id)

    try {
      const response = await fetch(`/api/admin/ai/config/${config.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir configuração')
      }

      const updatedConfigs = configs.filter(c => c.id !== config.id)
      onConfigsChange(updatedConfigs)
      
      toast.success('Configuração excluída com sucesso!')
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir configuração')
    } finally {
      setIsDeleting(null)
    }
  }

  const testConfig = async (configId: string) => {
    setIsTesting(configId)
    
    // Encontrar a configuração para personalizar o teste
    const config = configs.find(c => c.id === configId)
    const testPrompt = config?.provider === 'v0' 
      ? 'Create a simple professional button component with primary blue color, hover effects, and the text "Test Button"'
      : 'Responda apenas "Teste OK" para confirmar que a conexão está funcionando.'

    try {
      const response = await fetch('/api/admin/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          configId,
          testPrompt
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Erro no teste')
      }

      const result = await response.json()
      
      // Mensagem personalizada baseada no provider
      if (result.provider === 'v0') {
        toast.success(`✨ V0 API funcionando! Componente gerado com sucesso (${result.responseTime}ms)`)
      } else {
        toast.success(`Teste realizado com sucesso! Resposta: ${result.response} (${result.responseTime}ms)`)
      }
      
      onReload() // Atualizar dados para mostrar novo uso

    } catch (error) {
      console.error('Erro no teste:', error)
      toast.error(error instanceof Error ? error.message : 'Erro no teste')
    } finally {
      setIsTesting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Botão Adicionar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Configurações de IA</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as configurações das APIs de IA
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Nova Configuração
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingConfig ? 'Editar Configuração de IA' : 'Nova Configuração de IA'}
            </CardTitle>
            <CardDescription>
              {editingConfig ? 'Edite a configuração de API de IA' : 'Adicione uma nova configuração de API de IA'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provedor</Label>
                  <Select 
                    value={formData.provider} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="groq">Groq</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="v0">V0 (Vercel)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  {formData.provider === 'groq' ? (
                    <div className="space-y-2">
                      <Select 
                        value={isCustomModel ? 'outros' : formData.model} 
                        onValueChange={(value) => {
                          if (value === 'outros') {
                            setIsCustomModel(true)
                            setFormData(prev => ({ ...prev, model: '' }))
                          } else {
                            setIsCustomModel(false)
                            setFormData(prev => ({ ...prev, model: value }))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {groqModels.map(model => (
                            <SelectItem key={model} value={model}>
                              {model === 'outros' ? 'Outros (personalizado)' : model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isCustomModel && (
                        <Input
                          value={formData.model}
                          onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                          placeholder="Digite o nome do modelo (ex: llama-3.2-90b-text-preview)"
                          required
                        />
                      )}
                    </div>
                  ) : formData.provider === 'v0' ? (
                    <div className="space-y-2">
                      <Select 
                        value={isCustomModel ? 'outros' : formData.model} 
                        onValueChange={(value) => {
                          if (value === 'outros') {
                            setIsCustomModel(true)
                            setFormData(prev => ({ ...prev, model: '' }))
                          } else {
                            setIsCustomModel(false)
                            setFormData(prev => ({ ...prev, model: value }))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo V0" />
                        </SelectTrigger>
                        <SelectContent>
                          {v0Models.map(model => (
                            <SelectItem key={model} value={model}>
                              {model === 'outros' ? 'Outros (personalizado)' : model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isCustomModel && (
                        <Input
                          value={formData.model}
                          onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                          placeholder="Digite o nome do modelo V0"
                          required
                        />
                      )}
                    </div>
                  ) : (
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Ex: gpt-4-turbo"
                      required
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">Chave da API</Label>
                  <Input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder={
                      formData.provider === 'v0' 
                        ? "Sua chave da API V0 (Vercel)" 
                        : "Sua chave da API"
                    }
                    required
                  />
                  {formData.provider === 'v0' && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Obtenha sua chave da API V0 em{' '}
                        <a 
                          href="https://vercel.com/dashboard/v0" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          vercel.com/dashboard/v0
                        </a>
                      </p>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Recursos V0:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Geração de componentes UI profissionais</li>
                          <li>• Landing pages otimizadas para conversão</li>
                          <li>• Design system moderno e responsivo</li>
                          <li>• Integração automática com Tailwind CSS</li>
                          <li>• Código HTML/CSS otimizado e limpo</li>
                          <li>• Suporte a animações e interações modernas</li>
                        </ul>
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <span className="text-green-700 font-medium">💡 Dica:</span>
                          <span className="text-green-600 ml-1">V0 gera páginas com qualidade superior para landing pages e componentes visuais</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Tokens Máximos</Label>
                  <Input
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    min={1}
                    max={32000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    min={0}
                    max={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Configuração Ativa</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição desta configuração..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      {editingConfig ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    <>
                      <Icons.save className="mr-2 h-4 w-4" />
                      {editingConfig ? 'Atualizar Configuração' : 'Criar Configuração'}
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

      {/* Lista de Configurações */}
      <div className="grid gap-4">
        {configs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Icons.bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma configuração encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                Adicione sua primeira configuração de IA para começar
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Icons.plus className="mr-2 h-4 w-4" />
                Adicionar Configuração
              </Button>
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => (
            <Card key={config.id} className={config.isActive ? 'border-green-500' : 'border-gray-300'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">
                        {config.provider.toUpperCase()} - {config.model}
                      </CardTitle>
                      {config.provider === 'v0' && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Icons.zap className="w-3 h-3 mr-1" />
                          UI Generator
                        </Badge>
                      )}
                      {config.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          <Icons.check className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Inativa
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {config.description || (
                        config.provider === 'v0' 
                          ? 'Gerador de componentes UI e landing pages profissionais da Vercel'
                          : 'Sem descrição'
                      )}
                    </CardDescription>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConfig(config.id)}
                      disabled={isTesting === config.id || !config.isActive}
                      title={!config.isActive ? 'Ative a configuração para testar' : 'Testar conexão'}
                    >
                      {isTesting === config.id ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <Icons.zap className="mr-2 h-4 w-4" />
                          Testar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(config)}
                      disabled={isSubmitting}
                    >
                      <Icons.edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(config)}
                      disabled={isToggling === config.id}
                      className={config.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {isToggling === config.id ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          {config.isActive ? 'Desativando...' : 'Ativando...'}
                        </>
                      ) : (
                        <>
                          {config.isActive ? (
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
                      onClick={() => handleDelete(config)}
                      disabled={isDeleting === config.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isDeleting === config.id ? (
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">
                      {config.provider === 'v0' ? 'Gerações máx:' : 'Tokens máx:'}
                    </span>
                    <br />
                    {config.maxTokens.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">
                      {config.provider === 'v0' ? 'Qualidade:' : 'Temperatura:'}
                    </span>
                    <br />
                    {config.provider === 'v0' ? 'Alta' : config.temperature}
                  </div>
                  <div>
                    <span className="font-medium">
                      {config.provider === 'v0' ? 'Componentes:' : 'Usos:'}
                    </span>
                    <br />
                    <span className={config.provider === 'v0' ? 'text-purple-600 font-semibold' : ''}>
                      {config._count.usageLogs}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Criado em:</span>
                    <br />
                    {new Date(config.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                {/* Informações específicas para V0 */}
                {config.provider === 'v0' && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icons.checkCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">Status V0</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-purple-700">Especialidade:</span>
                        <div className="text-purple-600 font-medium">Landing Pages & UI</div>
                      </div>
                      <div>
                        <span className="text-purple-700">Framework:</span>
                        <div className="text-purple-600 font-medium">React + Tailwind</div>
                      </div>
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