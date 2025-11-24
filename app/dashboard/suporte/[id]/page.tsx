"use client"

import { useState, useEffect, useRef, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    content: string
    createdAt: string
    user: {
        id: string
        name: string
        image: string | null
    }
    attachments: {
        id: string
        url: string
        filename: string
        type: string
    }[]
}

interface Ticket {
    id: string
    subject: string
    description: string
    status: "OPEN" | "IN_PROGRESS" | "CLOSED"
    priority: "LOW" | "MEDIUM" | "HIGH"
    createdAt: string
    protocol: string
}

export default function TicketChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: session } = useSession()
    const router = useRouter()
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketRes, msgsRes] = await Promise.all([
                    fetch(`/api/tickets/${id}`),
                    fetch(`/api/tickets/${id}/messages`)
                ])

                if (ticketRes.ok) {
                    const ticketData = await ticketRes.json()
                    setTicket(ticketData)
                }

                if (msgsRes.ok) {
                    const msgsData = await msgsRes.json()
                    setMessages(msgsData)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Erro ao carregar dados do ticket")
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchData()
        }
    }, [id])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!newMessage.trim() && !selectedFile) || isSending) return

        setIsSending(true)
        try {
            let attachments = []

            if (selectedFile) {
                const reader = new FileReader()
                const base64 = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string)
                    reader.readAsDataURL(selectedFile)
                })

                const uploadRes = await fetch("/api/upload-images", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        images: [base64],
                        projectId: "support_ticket"
                    })
                })

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json()
                    if (uploadData.successful?.[0]) {
                        attachments.push({
                            url: uploadData.successful[0].url,
                            filename: selectedFile.name,
                            type: selectedFile.type.startsWith("image/") ? "image" : "file"
                        })
                    }
                }
            }

            const response = await fetch(`/api/tickets/${id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newMessage,
                    attachments
                })
            })

            if (response.ok) {
                const message = await response.json()
                setMessages((prev) => [...prev, message])
                setNewMessage("")
                setSelectedFile(null)
            } else {
                toast.error("Erro ao enviar mensagem")
            }
        } catch (error) {
            console.error("Error sending message:", error)
            toast.error("Erro ao enviar mensagem")
        } finally {
            setIsSending(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "OPEN": return "bg-blue-500"
            case "IN_PROGRESS": return "bg-yellow-500"
            case "CLOSED": return "bg-green-500"
            default: return "bg-gray-500"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "OPEN": return "Aberto"
            case "IN_PROGRESS": return "Em Andamento"
            case "CLOSED": return "Fechado"
            default: return status
        }
    }

    const isTicketClosed = ticket?.status === "CLOSED"

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
                    <Icons.arrowLeft className="mr-2 h-4 w-4" />
                    Voltar para lista
                </Button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white dark:bg-card p-6 rounded-2xl border shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{ticket?.subject || "Carregando..."}</h1>
                            {ticket && (
                                <Badge variant="outline" className="font-normal">
                                    #{ticket.protocol}
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground max-w-2xl">
                            {ticket?.description}
                        </p>
                    </div>

                    {ticket && (
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-muted/50 p-2 rounded-lg border">
                            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(ticket.status)}`} />
                            <span className="text-sm font-medium">
                                {getStatusLabel(ticket.status)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-sm bg-white dark:bg-card rounded-2xl">
                <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Icons.messageSquare className="h-5 w-5 text-primary" />
                        Histórico de Conversa
                    </CardTitle>
                    {isTicketClosed && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Ticket Encerrado
                        </Badge>
                    )}
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-muted/10">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Icons.messageSquare className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Nenhuma mensagem ainda</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Descreva seu problema detalhadamente para que possamos ajudar você da melhor forma.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.user.id === session?.user?.id
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                        <Avatar className="h-8 w-8 mt-1 border-2 border-white dark:border-card shadow-sm">
                                            <AvatarImage src={msg.user.image || ""} />
                                            <AvatarFallback className={isMe ? "bg-primary text-primary-foreground" : ""}>
                                                {msg.user.name?.[0] || "?"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className={`group relative rounded-2xl p-4 shadow-sm ${isMe
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-white dark:bg-card border rounded-tl-none"
                                            }`}>
                                            <div className="flex items-center justify-between gap-4 mb-1">
                                                <span className={`text-xs font-medium ${isMe ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                                    {msg.user.name}
                                                </span>
                                                <span className={`text-[10px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                {msg.content}
                                            </p>

                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {msg.attachments.map((att) => (
                                                        <div key={att.id}>
                                                            {att.type === "image" ? (
                                                                <div
                                                                    onClick={() => setLightboxImage(att.url)}
                                                                    className="cursor-pointer hover:opacity-90 transition-opacity overflow-hidden rounded-lg border bg-black/5"
                                                                >
                                                                    <img
                                                                        src={att.url}
                                                                        alt={att.filename}
                                                                        className="max-w-full max-h-60 object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <a
                                                                    href={att.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`flex items-center gap-2 text-xs p-2 rounded-md ${isMe ? "bg-primary-foreground/10 hover:bg-primary-foreground/20" : "bg-muted hover:bg-muted/80"
                                                                        }`}
                                                                >
                                                                    <Icons.paperclip className="h-3 w-3" />
                                                                    <span className="underline">{att.filename}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                <div className="p-4 border-t bg-white dark:bg-card">
                    {isTicketClosed ? (
                        <div className="flex flex-col items-center justify-center py-4 text-center space-y-2 bg-gray-50 dark:bg-muted/30 rounded-xl border border-dashed">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <h3 className="font-medium">Este ticket foi encerrado</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Não é possível enviar novas mensagens. Se precisar de mais ajuda, por favor abra um novo ticket.
                            </p>
                        </div>
                    ) : (
                        <>
                            {selectedFile && (
                                <div className="mb-3 flex items-center gap-3 bg-muted/50 p-2 pl-3 rounded-lg border w-fit">
                                    <div className="h-8 w-8 bg-background rounded-md flex items-center justify-center border">
                                        <Icons.image className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium truncate max-w-[200px]">
                                            {selectedFile.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 ml-2 hover:bg-background rounded-full"
                                        onClick={() => setSelectedFile(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) setSelectedFile(e.target.files[0])
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-11 w-11 shrink-0 rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Anexar imagem"
                                >
                                    <Icons.image className="h-5 w-5 text-muted-foreground" />
                                </Button>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    disabled={isSending}
                                    className="h-11 rounded-full px-5 bg-gray-50 dark:bg-muted/30 border-gray-200 dark:border-border focus-visible:ring-offset-0"
                                />
                                <Button
                                    type="submit"
                                    disabled={isSending || (!newMessage.trim() && !selectedFile)}
                                    className="h-11 w-11 shrink-0 rounded-full"
                                    size="icon"
                                >
                                    {isSending ? (
                                        <Icons.spinner className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Icons.send className="h-5 w-5" />
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </Card>

            {/* Image Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img
                        src={lightboxImage}
                        alt="Imagem ampliada"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    )
}
