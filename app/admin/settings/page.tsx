"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportEmail: string
  maxProjectsPerUser: number
  enableNotifications: boolean
  enableRegistrations: boolean
  maintenanceMode: boolean
  webhookUrl: string
  apiKeys: {
    n8n: string
    email: string
  }
}

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Site 24 Horas",
    siteDescription: "Criação de landing pages em 24 horas",
    contactEmail: "contato@site24h.com",
    supportEmail: "suporte@site24h.com",
    maxProjectsPerUser: 5,
    enableNotifications: true,
    enableRegistrations: true,
    maintenanceMode: false,
    webhookUrl: "",
    apiKeys: {
      n8n: "",
      email: ""
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.status === 403) {
        toast.error("Acesso negado. Você não tem permissão de administrador.")
        router.push('/dashboard')
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error("Erro ao carregar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }

      toast.success("Configurações salvas com sucesso!")
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error("Erro ao salvar configurações")
    } finally {
      setIsSaving(false)
    }
  }

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/admin/settings/test-webhook', {
        method: 'POST'
      })

      if (response.ok) {
        toast.success("Webhook testado com sucesso!")
      } else {
        throw new Error('Erro no teste do webhook')
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error)
      toast.error("Erro ao testar webhook")
    }
  }

  useEffect(() => {
    if (session) {
      fetchSettings()
    }
  }, [session])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Configure aspectos gerais da plataforma
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
          <Icons.save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>
                Configure as informações básicas da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome do Site</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de Contato</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descrição do Site</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email de Suporte</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Usuário */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Usuário</CardTitle>
              <CardDescription>
                Gerencie limites e permissões de usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxProjects">Máximo de Projetos por Usuário</Label>
                <Input
                  id="maxProjects"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxProjectsPerUser}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    maxProjectsPerUser: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Novos Registros</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que novos usuários se cadastrem na plataforma
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableRegistrations}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableRegistrations: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Envia notificações por email para usuários
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enableNotifications: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrações e APIs</CardTitle>
              <CardDescription>
                Configure integrações com serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (n8n)</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhookUrl"
                    value={settings.webhookUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://n8n.example.com/webhook/..."
                  />
                  <Button variant="outline" onClick={testWebhook}>
                    <Icons.zap className="w-4 h-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="n8nKey">Chave API n8n</Label>
                  <Input
                    id="n8nKey"
                    type="password"
                    value={settings.apiKeys.n8n}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      apiKeys: { ...prev.apiKeys, n8n: e.target.value }
                    }))}
                    placeholder="••••••••••••"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailKey">Chave API Email</Label>
                  <Input
                    id="emailKey"
                    type="password"
                    value={settings.apiKeys.email}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      apiKeys: { ...prev.apiKeys, email: e.target.value }
                    }))}
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manutenção */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Modo de Manutenção</CardTitle>
              <CardDescription>
                Configure o modo de manutenção da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Quando ativado, apenas administradores podem acessar o sistema
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, maintenanceMode: checked }))
                  }
                />
              </div>

              {settings.maintenanceMode && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Icons.alertTriangle className="w-4 h-4" />
                    <p className="font-medium">Modo de Manutenção Ativo</p>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    O sistema está atualmente em modo de manutenção. Apenas administradores podem acessar.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Ações de Manutenção</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Icons.database className="w-6 h-6" />
                    <span className="font-medium">Backup do Banco</span>
                    <span className="text-sm text-muted-foreground">Criar backup completo</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Icons.trash2 className="w-6 h-6" />
                    <span className="font-medium">Limpar Cache</span>
                    <span className="text-sm text-muted-foreground">Limpar cache do sistema</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Icons.fileText className="w-6 h-6" />
                    <span className="font-medium">Logs do Sistema</span>
                    <span className="text-sm text-muted-foreground">Ver logs de erro</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                    <Icons.activity className="w-6 h-6" />
                    <span className="font-medium">Status da API</span>
                    <span className="text-sm text-muted-foreground">Verificar saúde da API</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}