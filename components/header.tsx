"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { useIsAdmin } from "@/hooks/use-is-admin"
import { useNotifications } from "@/hooks/use-notifications"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  showAuthButtons?: boolean
}

export function Header({ showAuthButtons = true }: HeaderProps) {
  const { data: session, status } = useSession()
  const { isAdmin } = useIsAdmin()
  const { unreadCount } = useNotifications()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/", redirect: true })
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 pt-4 px-6 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl tracking-tight">Ozires</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-64">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar Projetos..."
              className="pl-9 rounded-full bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground relative" asChild>
              <Link href="/dashboard/notificacoes">
                <Icons.bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" asChild>
              <Link href="/dashboard/configuracoes">
                <Icons.settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {showAuthButtons && (
            <div className="flex items-center gap-3 pl-2 border-l">
              {status === "loading" ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-auto gap-3 rounded-full hover:bg-transparent px-0">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start text-left hidden md:flex">
                        <span className="text-sm font-semibold">{session.user.name}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user.name && (
                          <p className="font-medium">{session.user.name}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <Icons.layoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/sites" className="cursor-pointer">
                        <Icons.folder className="mr-2 h-4 w-4" />
                        Meus Projetos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/configuracoes" className="cursor-pointer">
                        <Icons.settings className="mr-2 h-4 w-4" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard" className="cursor-pointer text-blue-600">
                            <Icons.shieldCheck className="mr-2 h-4 w-4" />
                            Painel Admin
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      <Icons.logout className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Começar Grátis</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}