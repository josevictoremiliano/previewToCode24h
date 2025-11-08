"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  className?: string
}

const sidebarItems = [
  {
    title: "Visão Geral",
    href: "/dashboard",
    icon: Icons.barChart,
  },
  {
    title: "Meus Sites",
    href: "/dashboard/sites",
    icon: Icons.globe,
  },
  {
    title: "Criar Novo Site",
    href: "/dashboard/criar-site",
    icon: Icons.plus,
    badge: "Novo",
  },
  {
    title: "Assinatura",
    href: "/dashboard/assinatura",
    icon: Icons.creditCard,
  },
  {
    title: "API Keys",
    href: "/dashboard/api-keys",
    icon: Icons.key,
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Icons.settings,
  },
  {
    title: "Notificações",  
    href: "/dashboard/notificacoes",
    icon: Icons.bell,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-muted font-medium text-primary"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
              asChild
            >
              <Link href="/api/auth/signout">
                <Icons.logout className="mr-2 h-4 w-4" />
                Sair
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}