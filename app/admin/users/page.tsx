"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface User {
  id: string
  name: string | null
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  _count: {
    projects: number
  }
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (roleFilter !== 'all') params.append('role', roleFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.status === 403) {
        toast.error("Acesso negado. Você não tem permissão de administrador.")
        router.push('/dashboard')
        return
      }
      
      if (!response.ok) {
        throw new Error('Erro ao carregar usuários')
      }

      const usersData = await response.json()
      setUsers(usersData)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error("Erro ao carregar usuários")
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/admin/users/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar role do usuário')
      }

      toast.success("Role do usuário atualizada com sucesso!")
      fetchUsers() // Recarregar a lista
      setSelectedUser(null)
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      toast.error("Erro ao atualizar role do usuário")
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchUsers()
    }
  }, [session, search, roleFilter])

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-100 text-purple-800">Administrador</Badge>
      case "USER":
        return <Badge className="bg-blue-100 text-blue-800">Usuário</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os usuários do sistema
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Encontre usuários específicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Pesquisar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="USER">Usuários</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers} variant="outline">
              <Icons.search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({users.length})</CardTitle>
          <CardDescription>Lista de todos os usuários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Projetos</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || 'Sem nome'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user._count.projects} projeto{user._count.projects !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Icons.edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                            <DialogDescription>
                              Altere as informações do usuário {selectedUser?.name || selectedUser?.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Role atual: {getRoleBadge(selectedUser?.role || 'USER')}</label>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Nova role:</label>
                              <Select 
                                defaultValue={selectedUser?.role}
                                onValueChange={(value) => {
                                  if (selectedUser) {
                                    setSelectedUser({...selectedUser, role: value as 'USER' | 'ADMIN'})
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USER">Usuário</SelectItem>
                                  <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                if (selectedUser) {
                                  updateUserRole(selectedUser.id, selectedUser.role)
                                }
                              }}
                              disabled={isUpdating}
                            >
                              {isUpdating && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                              Salvar Alterações
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <Icons.eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}