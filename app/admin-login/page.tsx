"use client"

import { signIn, useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("admin@site24h.com")
  const [password, setPassword] = useState("admin123456")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        alert('Erro no login: ' + result.error)
      } else if (result?.ok) {
        // Recarregar a página para atualizar a sessão
        window.location.href = '/admin/projects'
      }
    } catch (error) {
      console.error('Erro no login:', error)
      alert('Erro no login')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Carregando...</div>
  }

  if (session?.user?.role === 'ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Login Admin - Sucesso!</CardTitle>
            <CardDescription>
              Você está logado como administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Role:</strong> {session.user.role}</p>
              <p><strong>Nome:</strong> {session.user.name}</p>
              
              <div className="flex gap-4">
                <Button onClick={() => window.location.href = '/admin/projects'}>
                  Ir para Projetos Admin
                </Button>
                <Button onClick={() => window.location.href = '/admin/dashboard'}>
                  Ir para Dashboard Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Login Administrativo</CardTitle>
          <CardDescription>
            Faça login com credenciais de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@site24h.com"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha do admin"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Fazendo login...' : 'Entrar como Admin'}
            </Button>
          </form>

          {session && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p className="text-sm"><strong>Sessão atual:</strong></p>
              <p className="text-sm">Email: {session.user?.email}</p>
              <p className="text-sm">Role: {session.user?.role || 'Não definido'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}