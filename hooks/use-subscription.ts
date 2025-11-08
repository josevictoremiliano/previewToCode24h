import { useState, useEffect } from "react"
import { toast } from "sonner"

interface UsageData {
  sitesUsed: number
  sitesLimit: number
  storageUsed: number
  storageLimit: number
  totalSites: number
  memberSince: string
  currentPlan: string
}

export function useSubscription() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/subscription/usage")
      
      if (!response.ok) {
        throw new Error("Falha ao carregar dados de uso")
      }

      const data = await response.json()
      setUsage(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      toast.error("Erro ao carregar dados de assinatura")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsage()
  }, [])

  return {
    usage,
    isLoading,
    error,
    refetch: fetchUsage,
  }
}