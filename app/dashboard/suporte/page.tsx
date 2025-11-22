"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Ticket {
    id: string
    subject: string
    description: string
    status: string
    priority: string
    createdAt: string
}

export default function SuportePage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        priority: "MEDIUM",
    })

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            const response = await fetch("/api/tickets")
            if (response.ok) {
                const data = await response.json()
                setTickets(data)
            }
        } catch (error) {
            console.error("Erro ao carregar tickets:", error)
            toast.error("Erro ao carregar tickets")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        try {
            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error("Erro ao criar ticket")

            toast.success("Ticket criado com sucesso!")
            setIsOpen(false)
            setFormData({ subject: "", description: "", priority: "MEDIUM" })
            fetchTickets()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao criar ticket")
        } finally {
            setIsCreating(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "OPEN":
                return <Badge className="bg-blue-100 text-blue-800">Aberto</Badge>
            case "IN_PROGRESS":
                return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>
            case "CLOSED":
                return <Badge className="bg-green-100 text-green-800">Fechado</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return <Badge variant="destructive">Alta</Badge>
            case "MEDIUM":
                return <Badge variant="secondary">Média</Badge>
            case "LOW":
                return <Badge variant="outline">Baixa</Badge>
            default:
                return <Badge variant="outline">{priority}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Suporte</h1>
                    <p className="text-muted-foreground">
                        Precisa de ajuda? Abra um chamado para nossa equipe.
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Icons.plus className="mr-2 h-4 w-4" />
                            Novo Chamado
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Abrir Novo Chamado</DialogTitle>
                            <DialogDescription>
                                Descreva seu problema detalhadamente para que possamos ajudar.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Assunto</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                    placeholder="Resumo do problema"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Prioridade</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a prioridade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Baixa</SelectItem>
                                        <SelectItem value="MEDIUM">Média</SelectItem>
                                        <SelectItem value="HIGH">Alta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descreva o problema em detalhes..."
                                    rows={5}
                                    required
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? (
                                        <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Icons.send className="h-4 w-4 mr-2" />
                                    )}
                                    Enviar Chamado
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-muted/50" />
                        </Card>
                    ))
                ) : tickets.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Icons.info className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum chamado encontrado</h3>
                            <p className="text-muted-foreground mb-4 text-center">
                                Você ainda não abriu nenhum chamado de suporte.
                            </p>
                            <Button variant="outline" onClick={() => setIsOpen(true)}>
                                Abrir Primeiro Chamado
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    tickets.map((ticket) => (
                        <Link href={`/dashboard/suporte/${ticket.id}`} key={ticket.id}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                                            <CardDescription>
                                                Aberto em {new Date(ticket.createdAt).toLocaleDateString('pt-BR')} às {new Date(ticket.createdAt).toLocaleTimeString('pt-BR')}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            {getStatusBadge(ticket.status)}
                                            {getPriorityBadge(ticket.priority)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {ticket.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
