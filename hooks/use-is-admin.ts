"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function useIsAdmin() {
  const { data: session } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/admin/verify')
        setIsAdmin(response.ok)
      } catch {
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [session])

  return { isAdmin, isLoading }
}