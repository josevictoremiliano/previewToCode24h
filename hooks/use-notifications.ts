import { useState, useEffect } from "react"
import { toast } from "sonner"

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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async (filters?: { read?: boolean; limit?: number }) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (filters?.read !== undefined) {
        params.append("read", filters.read.toString())
      }
      if (filters?.limit) {
        params.append("limit", filters.limit.toString())
      }

      const response = await fetch(`/api/notifications?${params}`)
      if (!response.ok) {
        throw new Error("Falha ao carregar notificações")
      }

      const data = await response.json()
      setNotifications(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      toast.error("Erro ao carregar notificações")
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, read: true }),
      })

      if (!response.ok) {
        throw new Error("Falha ao marcar como lida")
      }

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch {
      toast.error("Erro ao marcar como lida")
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (!response.ok) {
        throw new Error("Falha ao marcar todas como lidas")
      }

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
      
      toast.success("Todas as notificações foram marcadas como lidas")
    } catch {
      toast.error("Erro ao marcar todas como lidas")
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao remover notificação")
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success("Notificação removida")
    } catch {
      toast.error("Erro ao remover notificação")
    }
  }

  const clearAllRead = async () => {
    try {
      const response = await fetch("/api/notifications?clearRead=true", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao limpar notificações lidas")
      }

      setNotifications(prev => prev.filter(n => !n.read))
      toast.success("Notificações lidas removidas")
    } catch {
      toast.error("Erro ao limpar notificações")
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length
  const readNotifications = notifications.filter(n => n.read)
  const unreadNotifications = notifications.filter(n => !n.read)

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
  }
}