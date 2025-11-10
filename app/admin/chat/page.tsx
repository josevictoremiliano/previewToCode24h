"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  status: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  chatMessages: Array<{
    id: string
    content: string
    isFromAdmin: boolean
    createdAt: string
    user: {
      name: string
      email: string
    }
  }>
}

export default function AdminChatPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/admin/projects/with-chat')
        if (!response.ok) throw new Error('Erro ao carregar projetos')
        
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error('Erro ao carregar projetos:', error)
        toast.error("Erro ao carregar projetos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedProject?.chatMessages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProject || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/admin/projects/${selectedProject.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          isFromAdmin: true
        })
      })

      if (!response.ok) throw new Error('Erro ao enviar mensagem')

      const newMsg = await response.json()
      
      // Atualizar o projeto selecionado
      setSelectedProject(prev => prev ? {
        ...prev,
        chatMessages: [...prev.chatMessages, newMsg]
      } : null)

      // Atualizar na lista de projetos
      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id 
          ? { ...p, chatMessages: [...p.chatMessages, newMsg] }
          : p
      ))

      setNewMessage("")
      toast.success("Mensagem enviada")
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error("Erro ao enviar mensagem")
    } finally {
      setIsSending(false)
    }
  }

  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case "PREVIEW":
        return <Badge className="bg-blue-100 text-blue-800">Preview</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Finalizado</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat & Suporte</h1>
        <p className="text-muted-foreground">
          Converse com os clientes sobre seus projetos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de Projetos */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos com Chat</CardTitle>
            <CardDescription>
              Clique em um projeto para ver as conversas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhum projeto com mensagens encontrado
                  </p>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-muted border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {project.user.name || project.user.email}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getProjectStatusBadge(project.status)}
                          {project.chatMessages.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {project.chatMessages.length} msg
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedProject ? (
                <>
                  <Icons.message className="h-5 w-5" />
                  Chat - {selectedProject.name}
                </>
              ) : (
                <>
                  <Icons.message className="h-5 w-5" />
                  Selecione um projeto
                </>
              )}
            </CardTitle>
            {selectedProject && (
              <CardDescription>
                Conversando com {selectedProject.user.name || selectedProject.user.email}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedProject ? (
              <div className="space-y-4">
                {/* Mensagens */}
                <ScrollArea className="h-[400px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {selectedProject.chatMessages.length === 0 ? (
                      <p className="text-muted-foreground text-center">
                        Nenhuma mensagem ainda. Comece a conversa!
                      </p>
                    ) : (
                      selectedProject.chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.isFromAdmin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!message.isFromAdmin && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedProject.user.image} />
                              <AvatarFallback>
                                {(selectedProject.user.name || selectedProject.user.email).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.isFromAdmin
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.isFromAdmin
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                          {message.isFromAdmin && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                A
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input de Nova Mensagem */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isSending}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <Icons.message className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Selecione um projeto para iniciar uma conversa
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}