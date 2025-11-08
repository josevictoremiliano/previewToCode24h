"use client"

import { useEffect, useState } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  project?: {
    id: string
    siteName: string
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setIsLoading(true)
        
        const response = await fetch('/api/notifications')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar notificações')
        }

        const data = await response.json()
        setNotifications(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao buscar notificações:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  return { notifications, isLoading, error }
}