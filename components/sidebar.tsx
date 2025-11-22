"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface SidebarProps {
  className?: string
}

const sidebarItems = [
  {
    title: "Visão Geral",
    href: "/dashboard",
    icon: Icons.layoutDashboard,
  },
  {
    title: "Meus Projetos",
    href: "/dashboard/sites",
    icon: Icons.folder,
  },
  {
    title: "Criar Novo",
    href: "/dashboard/criar-site",
    icon: Icons.plusCircle,
  },
  {
    title: "Assinatura",
    href: "/dashboard/assinatura",
    icon: Icons.creditCard,
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Icons.settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64 flex flex-col h-full", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-4 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start relative h-12 mb-1 rounded-xl transition-all duration-200",
                  pathname === item.href
                    ? "bg-white shadow-sm text-primary hover:bg-white hover:text-primary"
                    : "text-muted-foreground hover:bg-transparent hover:text-primary"
                )}
                asChild
              >
                <Link href={item.href}>
                  <span className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary transition-opacity duration-200",
                    pathname === item.href ? "opacity-100" : "opacity-0"
                  )} />
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl h-12"
          asChild
        >
          <Link href="/api/auth/signout">
            <Icons.logout className="mr-3 h-5 w-5" />
            <span className="font-medium">Sair</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}