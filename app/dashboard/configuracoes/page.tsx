"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

export default function ConfiguracoesPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "",
    phone: "",
    company: "",
    website: "",
  })
  
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    projectNotifications: true,
    marketingEmails: false,
    weeklyReport: true,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    allowIndexing: true,
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar sessão
      await update({
        name: formData.name,
      })
      
      toast.success("Perfil atualizado com sucesso!")
    } catch {
      toast.error("Erro ao atualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Senha alterada com sucesso!")
    } catch {
      toast.error("Erro ao alterar senha")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Conta excluída com sucesso")
      await signOut({ callbackUrl: "/" })
    } catch {
      toast.error("Erro ao excluir conta")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Simular download de dados
      const data = {
        user: session?.user,
        projects: [],
        created_at: new Date().toISOString(),
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'meus-dados-site24h.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success("Dados exportados com sucesso!")
    } catch {
      toast.error("Erro ao exportar dados")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta e preferências
        </p>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.user className="h-5 w-5" />
            Perfil
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="text-lg">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button type="button" variant="outline" size="sm">
                  <Icons.upload className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG ou GIF. Máximo 2MB.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://seusite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Icons.save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie sua senha e configurações de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Digite sua senha atual"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Digite sua nova senha"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirme sua nova senha"
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Icons.key className="h-4 w-4 mr-2" />
              )}
              Alterar Senha
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como você quer receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Atualizações por email</Label>
              <div className="text-sm text-muted-foreground">
                Receba emails sobre atualizações importantes
              </div>
            </div>
            <Switch
              checked={notifications.emailUpdates}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, emailUpdates: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações de projetos</Label>
              <div className="text-sm text-muted-foreground">
                Seja notificado sobre mudanças de status dos seus sites
              </div>
            </div>
            <Switch
              checked={notifications.projectNotifications}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, projectNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emails de marketing</Label>
              <div className="text-sm text-muted-foreground">
                Receba dicas, novidades e ofertas especiais
              </div>
            </div>
            <Switch
              checked={notifications.marketingEmails}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, marketingEmails: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Relatório semanal</Label>
              <div className="text-sm text-muted-foreground">
                Receba um resumo semanal das suas atividades
              </div>
            </div>
            <Switch
              checked={notifications.weeklyReport}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, weeklyReport: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.lock className="h-5 w-5" />
            Privacidade
          </CardTitle>
          <CardDescription>
            Controle a visibilidade das suas informações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Perfil público</Label>
              <div className="text-sm text-muted-foreground">
                Permitir que outros vejam seu perfil
              </div>
            </div>
            <Switch
              checked={privacy.profileVisible}
              onCheckedChange={(checked) => 
                setPrivacy(prev => ({ ...prev, profileVisible: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mostrar email</Label>
              <div className="text-sm text-muted-foreground">
                Exibir seu email no perfil público
              </div>
            </div>
            <Switch
              checked={privacy.showEmail}
              onCheckedChange={(checked) => 
                setPrivacy(prev => ({ ...prev, showEmail: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Indexação por buscadores</Label>
              <div className="text-sm text-muted-foreground">
                Permitir que buscadores encontrem seu perfil
              </div>
            </div>
            <Switch
              checked={privacy.allowIndexing}
              onCheckedChange={(checked) => 
                setPrivacy(prev => ({ ...prev, allowIndexing: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados e Conta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.database className="h-5 w-5" />
            Dados e Conta
          </CardTitle>
          <CardDescription>
            Exporte seus dados ou exclua sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Exportar dados</h4>
              <p className="text-sm text-muted-foreground">
                Baixe uma cópia de todos os seus dados
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Icons.download className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-900">Excluir conta</h4>
              <p className="text-sm text-red-700">
                Exclua permanentemente sua conta e todos os dados
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount} 
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Icons.trash className="h-4 w-4 mr-2" />
              )}
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}