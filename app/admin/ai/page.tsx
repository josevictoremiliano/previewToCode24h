"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { ConfigTab } from "./components/config-tab"
import { PromptsTab } from "./components/prompts-tab"
import { UsageTab } from "./components/usage-tab"
import { V0Dashboard } from "./components/v0-dashboard"
import { V0Monitoring } from "./components/v0-monitoring"
import { V0Documentation } from "./components/v0-documentation"

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

interface PromptTemplate {
  id: string
  name: string
  key: string
  category: string
  description?: string
  isActive: boolean
  variables: string[]
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  _count: {
    usageLogs: number
  }
}

export default function AiManagementPage() {
  const [configs, setConfigs] = useState<AiConfig[]>([])
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Carregar configurações e prompts em paralelo
      const [configsResponse, promptsResponse] = await Promise.all([
        fetch('/api/admin/ai/config'),
        fetch('/api/admin/ai/prompts')
      ])

      if (configsResponse.ok) {
        const configsData = await configsResponse.json()
        setConfigs(configsData)
      }

      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json()
        setPrompts(promptsData)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados da IA')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeDefaultPrompts = async () => {
    try {
      const response = await fetch('/api/admin/ai/prompts/init', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Erro ao inicializar prompts')

      const result = await response.json()
      toast.success(result.message)
      
      // Recarregar prompts
      const promptsResponse = await fetch('/api/admin/ai/prompts')
      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json()
        setPrompts(promptsData)
      }

    } catch (error) {
      console.error('Erro ao inicializar prompts:', error)
      toast.error('Erro ao inicializar prompts padrão')
    }
  }

  const activeConfig = configs.find(config => config.isActive)
  const totalUsage = configs.reduce((sum, config) => sum + config._count.usageLogs, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Gestão de IA</h1>
        <p className="text-muted-foreground">
          Configure e gerencie as integrações de inteligência artificial
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurações</CardTitle>
            <Icons.settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeConfig ? `Ativa: ${activeConfig.provider}` : 'Nenhuma ativa'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Icons.fileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prompts.length}</div>
            <p className="text-xs text-muted-foreground">
              {prompts.filter(p => p.isActive).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Total</CardTitle>
            <Icons.activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Requisições feitas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Icons.checkCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeConfig ? '✅' : '❌'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeConfig ? 'Configurado' : 'Não configurado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inicialização Rápida */}
      {prompts.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.rocket className="h-5 w-5" />
              Começar Rapidamente
            </CardTitle>
            <CardDescription>
              Inicialize os templates de prompt padrão para começar a usar a IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={initializeDefaultPrompts} className="w-full">
              <Icons.plus className="mr-2 h-4 w-4" />
              Inicializar Prompts Padrão
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="prompts">Templates de Prompt</TabsTrigger>
          <TabsTrigger value="usage">Histórico de Uso</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <V0Dashboard configs={configs} />
          <V0Monitoring configs={configs} />
          <V0Documentation />
          <ConfigTab 
            configs={configs} 
            onConfigsChange={setConfigs}
            onReload={loadData}
          />
        </TabsContent>

        <TabsContent value="prompts">
          <PromptsTab 
            prompts={prompts}
            onPromptsChange={setPrompts}
            onReload={loadData}
            onInitializeDefaults={initializeDefaultPrompts}
          />
        </TabsContent>

        <TabsContent value="usage">
          <UsageTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}