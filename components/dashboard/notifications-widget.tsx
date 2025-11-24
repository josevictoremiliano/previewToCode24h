"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface Notification {
    id: string
    type: "info" | "success" | "warning" | "error"
    title: string
    message: string
    read: boolean
    createdAt: string
    project?: {
        id: string
        siteName: string
        status: string
    }
}

interface NotificationsWidgetProps {
    notifications: Notification[]
}

export function NotificationsWidget({ notifications }: NotificationsWidgetProps) {
    // Determinar link baseado no conteúdo da notificação
    const getNotificationLink = (notification: Notification) => {
        const msg = notification.message.toLowerCase()
        const title = notification.title.toLowerCase()

        // Se menciona ticket ou suporte, vai para o ticket
        if (msg.includes('ticket') || title.includes('ticket') || msg.includes('suporte')) {
            return notification.project?.id
                ? `/dashboard/suporte/${notification.project.id}`
                : '/dashboard/suporte'
        }

        // Se tem projeto associado, vai para preview
        if (notification.project?.id) {
            return `/dashboard/sites/${notification.project.id}/preview`
        }

        // Fallback: página de notificações
        return '/dashboard/notificacoes'
    }

    return (
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Notificações</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-100" asChild>
                        <Link href="/dashboard/notificacoes">
                            <Icons.arrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4 ">
                    {notifications.slice(0, 5).map((notification) => (
                        <Link href={getNotificationLink(notification)} key={notification.id}>
                            <div
                                className={`p-4 mb-2 hover:shadow-sm rounded-2xl cursor-pointer hover:opacity-80 transition-opacity ${notification.type === 'success' ? 'bg-green-50' :
                                    notification.type === 'warning' ? 'bg-yellow-50' :
                                        notification.type === 'error' ? 'bg-red-50' :
                                            'bg-blue-50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div
                                        className={`h-8 w-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                                notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}
                                    >
                                        <Icons.bell className="h-4 w-4" />
                                    </div>
                                    {!notification.read && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    )}
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                </p>
                            </div>
                        </Link>
                    ))}

                    {notifications.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Nenhuma notificação recente
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
