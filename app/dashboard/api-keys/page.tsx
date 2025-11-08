"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  active: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  permissions: Record<string, any> | null
  createdAt: string
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newKey, setNewKey] = useState<{ key: string; name: string } | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/api-keys")
      
      if (!response.ok) {
        throw new Error("Falha ao carregar API Keys")
      }

      const data = await response.json()
      setApiKeys(data)
    } catch (error) {
      toast.error("Erro ao carregar API Keys")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Nome da API Key é obrigatório")
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Falha ao criar API Key")
      }

      const data = await response.json()
      setNewKey({ key: data.key, name: data.name })
      setNewKeyName("")
      setIsDialogOpen(false)
      await fetchApiKeys()
      toast.success("API Key criada com sucesso!")
    } catch (error) {
      toast.error("Erro ao criar API Key")
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleApiKey = async (id: string, active: boolean) => {
    try {
      const response = await fetch("/api/api-keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar API Key")
      }

      await fetchApiKeys()
      toast.success(`API Key ${!active ? "ativada" : "desativada"} com sucesso!`)
    } catch (error) {
      toast.error("Erro ao atualizar API Key")
      console.error(error)
    }
  }

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/api-keys?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao deletar API Key")
      }

      await fetchApiKeys()
      toast.success("API Key deletada com sucesso!")
    } catch (error) {
      toast.error("Erro ao deletar API Key")
      console.error(error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado para a área de transferência!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Gerencie chaves de API para integrações externas (n8n, webhooks, etc.)
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icons.plus className="h-4 w-4 mr-2" />
              Nova API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova API Key</DialogTitle>
              <DialogDescription>
                Crie uma nova chave de API para integrar com sistemas externos como n8n.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Nome da API Key</Label>
                <Input
                  id="keyName"
                  placeholder="Ex: n8n Production, Webhook Sistema X"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createApiKey} disabled={isCreating}>
                {isCreating ? (
                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Icons.key className="h-4 w-4 mr-2" />
                )}
                Criar API Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mostrar nova chave criada */}
      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              <Icons.checkCircle className="h-5 w-5 inline mr-2" />
              API Key Criada: {newKey.name}
            </CardTitle>
            <CardDescription className="text-green-700">
              Guarde esta chave em local seguro. Ela não será exibida novamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 p-3 bg-white border rounded">
              <code className="flex-1 text-sm font-mono">{newKey.key}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(newKey.key)}
              >
                <Icons.copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setNewKey(null)}
            >
              <Icons.x className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Suas API Keys</CardTitle>
          <CardDescription>
            Lista de todas as suas chaves de API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Icons.key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma API Key</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira API Key para integrar com sistemas externos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge variant={apiKey.active ? "default" : "secondary"}>
                        {apiKey.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-mono">{apiKey.keyPreview}</span>
                      </p>
                      <p>
                        Criada {formatDistanceToNow(new Date(apiKey.createdAt), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                      {apiKey.lastUsedAt && (
                        <p>
                          Último uso {formatDistanceToNow(new Date(apiKey.lastUsedAt), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleApiKey(apiKey.id, apiKey.active)}
                    >
                      {apiKey.active ? (
                        <>
                          <Icons.x className="h-4 w-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Icons.check className="h-4 w-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deletar API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar a API Key &quot;{apiKey.name}&quot;? 
                            Esta ação não pode ser desfeita e todas as integrações usando esta chave irão parar de funcionar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteApiKey(apiKey.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar as API Keys</CardTitle>
          <CardDescription>
            Instruções para integrar com n8n e outros sistemas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Atualizando status de projetos (n8n)</h4>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
              <div>POST /api/n8n/update-project</div>
              <div>Headers: X-API-Key: sua_api_key_aqui</div>
              <div>Body: {`{ "projectId": "...", "status": "PREVIEW", "previewUrl": "..." }`}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Buscando projetos</h4>
            <div className="bg-gray-100 p-3 rounded font-mono text-sm">
              <div>GET /api/n8n/projects?status=PENDING</div>
              <div>Headers: X-API-Key: sua_api_key_aqui</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Segurança:</strong> Mantenha suas API Keys seguras e nunca as compartilhe publicamente. 
              Se uma chave for comprometida, desative-a imediatamente e crie uma nova.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}