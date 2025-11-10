"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/admin-sidebar"
import { Header } from "@/components/header"
import { toast } from "sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const verifyAdmin = async () => {
      if (status === 'loading') return
      
      if (!session) {
        router.push('/auth/signin')
        return
      }

      try {
        const response = await fetch('/api/admin/verify')
        
        if (response.status === 403) {
          toast.error("Acesso negado. Você não tem permissão de administrador.")
          router.push('/dashboard')
          return
        }

        if (response.ok) {
          setIsVerified(true)
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Erro ao verificar permissões admin:', error)
        router.push('/dashboard')
      }
    }

    verifyAdmin()
  }, [session, status, router])

  if (status === 'loading' || !isVerified) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar className="w-64 border-r" />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}