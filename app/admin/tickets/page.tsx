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
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Ticket {
    id: string
    protocol: string
    subject: string
    description: string
    status: string
    priority: string
    createdAt: string
    updatedAt: string
    user: {
        id: string
        name: string
        email: string
        image?: string
    }
    messages?: TicketMessage[]
    _count?: {
        messages: number
    }
}

interface TicketMessage {
    id: string
    content: string
    isFromAdmin: boolean
    createdAt: string
    user: {
        id: string
        name: string
        image?: string
    }
    attachments?: Array<{
        id: string
        url: string
        filename: string
        type: string
    }>
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<TicketMessage[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        fetchTickets()
    }, [])

    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id)
        }
    }, [selectedTicket])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchTickets = async () => {
        try {
            const response = await fetch('/api/admin/tickets')
            if (!response.ok) throw new Error('Erro ao carregar tickets')

            const data = await response.json()
            setTickets(data)
        } catch (error) {
            console.error('Erro ao carregar tickets:', error)
            toast.error("Erro ao carregar tickets")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchMessages = async (ticketId: string) => {
        try {
            const response = await fetch(`/api/tickets/${ticketId}/messages`)
            if (!response.ok) throw new Error('Erro ao carregar mensagens')

            const data = await response.json()
            setMessages(data)
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error)
            toast.error("Erro ao carregar mensagens")
        }
    }

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !selectedFile) || !selectedTicket || isSending) return

        setIsSending(true)
        try {
            let attachments = []

            // Upload de imagem se houver
            if (selectedFile) {
                const reader = new FileReader()
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.readAsDataURL(selectedFile)
                })
                const base64 = await base64Promise

                const uploadResponse = await fetch('/api/upload-images', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        images: [{ data: base64, filename: selectedFile.name }],
                        project: 'support_tickets'
                    })
                })

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json()
                    attachments = uploadData.urls.map((url: string, index: number) => ({
                        url,
                        filename: selectedFile.name,
                        type: 'image'
                    }))
                }
            }

            const response = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newMessage,
                    isFromAdmin: true,
                    attachments
                })
            })

            if (!response.ok) throw new Error('Erro ao enviar mensagem')

            const newMsg = await response.json()
            setMessages(prev => [...prev, newMsg])
            setNewMessage("")
            setSelectedFile(null)
            toast.success("Mensagem enviada")

            // Atualizar a lista de tickets
            fetchTickets()
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error)
            toast.error("Erro ao enviar mensagem")
        } finally {
            setIsSending(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedTicket) return

        try {
            const response = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) throw new Error('Erro ao atualizar status')

            toast.success("Status atualizado")

            // Atualizar ticket selecionado e lista
            setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
            fetchTickets()
        } catch (error) {
            console.error('Erro ao atualizar status:', error)
            toast.error("Erro ao atualizar status")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OPEN":
                return <Badge className="bg-blue-100 text-blue-800">Aberto</Badge>
            case "IN_PROGRESS":
                return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>
            case "CLOSED":
                return <Badge className="bg-gray-100 text-gray-800">Fechado</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return <Badge variant="destructive">Alta</Badge>
            case "MEDIUM":
                return <Badge className="bg-orange-100 text-orange-800">Média</Badge>
            case "LOW":
                return <Badge variant="outline">Baixa</Badge>
            default:
                return <Badge variant="secondary">{priority}</Badge>
        }
    }

    const filteredTickets = tickets.filter(ticket =>
        filterStatus === "all" || ticket.status === filterStatus
    )

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Arquivo muito grande. Máximo 5MB")
                return
            }
            setSelectedFile(file)
        }
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
                <h1 className="text-3xl font-bold tracking-tight">Tickets de Suporte</h1>
                <p className="text-muted-foreground">
                    Gerencie todos os tickets de suporte dos usuários
                </p>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    onClick={() => setFilterStatus("all")}
                >
                    Todos ({tickets.length})
                </Button>
                <Button
                    variant={filterStatus === "OPEN" ? "default" : "outline"}
                    onClick={() => setFilterStatus("OPEN")}
                >
                    Abertos ({tickets.filter(t => t.status === "OPEN").length})
                </Button>
                <Button
                    variant={filterStatus === "IN_PROGRESS" ? "default" : "outline"}
                    onClick={() => setFilterStatus("IN_PROGRESS")}
                >
                    Em Andamento ({tickets.filter(t => t.status === "IN_PROGRESS").length})
                </Button>
                <Button
                    variant={filterStatus === "CLOSED" ? "default" : "outline"}
                    onClick={() => setFilterStatus("CLOSED")}
                >
                    Fechados ({tickets.filter(t => t.status === "CLOSED").length})
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Lista de Tickets */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tickets</CardTitle>
                        <CardDescription>
                            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[480px]">
                            <div className="space-y-2">
                                {filteredTickets.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        Nenhum ticket encontrado
                                    </p>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTicket?.id === ticket.id
                                                    ? 'bg-muted border-primary'
                                                    : 'hover:bg-muted/50'
                                                }`}
                                            onClick={() => setSelectedTicket(ticket)}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">#{ticket.protocol}</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {ticket.subject}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {getStatusBadge(ticket.status)}
                                                        {getPriorityBadge(ticket.priority)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {ticket.user.name || ticket.user.email}
                                                    </p>
                                                    {ticket._count && ticket._count.messages > 0 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {ticket._count.messages} msg
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
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    {selectedTicket ? (
                                        `Ticket #${selectedTicket.protocol}`
                                    ) : (
                                        "Selecione um ticket"
                                    )}
                                </CardTitle>
                                {selectedTicket && (
                                    <CardDescription>
                                        {selectedTicket.user.name || selectedTicket.user.email} - {selectedTicket.subject}
                                    </CardDescription>
                                )}
                            </div>
                            {selectedTicket && (
                                <Select value={selectedTicket.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Aberto</SelectItem>
                                        <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                                        <SelectItem value="CLOSED">Fechado</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {selectedTicket ? (
                            <div className="space-y-4">
                                {/* Mensagens */}
                                <ScrollArea className="h-[380px] border rounded-lg p-4">
                                    <div className="space-y-4">
                                        {messages.length === 0 ? (
                                            <p className="text-muted-foreground text-center">
                                                Nenhuma mensagem ainda
                                            </p>
                                        ) : (
                                            messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex gap-3 ${message.isFromAdmin ? 'justify-end' : 'justify-start'
                                                        }`}
                                                >
                                                    {!message.isFromAdmin && (
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={message.user.image} />
                                                            <AvatarFallback>
                                                                {(message.user.name || 'U').charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div
                                                        className={`max-w-[70%] rounded-lg p-3 ${message.isFromAdmin
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted'
                                                            }`}
                                                    >
                                                        {message.isFromAdmin && (
                                                            <Badge className="mb-1 bg-primary-foreground text-primary">Suporte</Badge>
                                                        )}
                                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                        {message.attachments && message.attachments.length > 0 && (
                                                            <div className="mt-2 space-y-2">
                                                                {message.attachments.map((att) => (
                                                                    <div key={att.id}>
                                                                        {att.type === "image" ? (
                                                                            <div
                                                                                onClick={() => setLightboxImage(att.url)}
                                                                                className="cursor-pointer hover:opacity-90 transition-opacity"
                                                                            >
                                                                                <img
                                                                                    src={att.url}
                                                                                    alt={att.filename}
                                                                                    className="rounded-md max-w-full max-h-60 object-cover"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <a
                                                                                href={att.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-xs underline"
                                                                            >
                                                                                {att.filename}
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p
                                                            className={`text-xs mt-1 ${message.isFromAdmin
                                                                    ? 'text-primary-foreground/70'
                                                                    : 'text-muted-foreground'
                                                                }`}
                                                        >
                                                            {new Date(message.createdAt).toLocaleString()}
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

                                {/* Preview da imagem selecionada */}
                                {selectedFile && (
                                    <div className="relative inline-block">
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Preview"
                                            className="h-20 w-20 object-cover rounded-md"
                                        />
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {/* Input de Nova Mensagem */}
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSending}
                                    >
                                        <Icons.image className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        placeholder="Digite sua resposta..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={isSending}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={(!newMessage.trim() && !selectedFile) || isSending}
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
                                        Selecione um ticket para ver as mensagens
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Image Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                    >
                        <X className="h-8 w-8" />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Imagem ampliada"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    )
}
