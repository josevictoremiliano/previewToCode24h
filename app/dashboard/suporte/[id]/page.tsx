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
import { X } from "lucide-react"

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
    status: string
    priority: string
    createdAt: string
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
                const msgsResponse = await fetch(`/api/tickets/${id}/messages`)
                if (msgsResponse.ok) {
                    const data = await msgsResponse.json()
                    setMessages(data)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
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

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>
                    <Icons.arrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <h1 className="text-2xl font-bold">Chat do Suporte</h1>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="border-b">
                    <CardTitle>Mensagens</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Icons.spinner className="h-6 w-6 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhuma mensagem ainda. Comece a conversa!
                        </p>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.user.id === session?.user?.id
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`flex gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"
                                            }`}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.user.image || ""} />
                                            <AvatarFallback>{msg.user.name?.[0] || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={`rounded-lg p-3 ${isMe
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                                }`}
                                        >
                                            <p className="text-sm font-medium mb-1 opacity-70">
                                                {msg.user.name}
                                            </p>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    {msg.attachments.map((att) => (
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
                                            <p className="text-[10px] mt-1 opacity-50 text-right">
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t bg-background">
                    {selectedFile && (
                        <div className="mb-2 flex items-center gap-2 bg-muted p-2 rounded-md">
                            <Icons.image className="h-4 w-4" />
                            <span className="text-sm truncate max-w-[200px]">
                                {selectedFile.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-auto"
                                onClick={() => setSelectedFile(null)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
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
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Icons.image className="h-4 w-4" />
                        </Button>
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            disabled={isSending}
                        />
                        <Button type="submit" disabled={isSending || (!newMessage.trim() && !selectedFile)}>
                            {isSending ? (
                                <Icons.spinner className="h-4 w-4 animate-spin" />
                            ) : (
                                <Icons.send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                </div>
            </Card>

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
