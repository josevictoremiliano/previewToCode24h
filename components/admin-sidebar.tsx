"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"

interface AdminSidebarProps {
  className?: string
}

const adminSidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Icons.barChart,
  },
  {
    title: "Gerenciar Projetos",
    href: "/admin/projects",
    icon: Icons.globe,
  },
  {
    title: "Gerenciar Usuários",
    href: "/admin/users",
    icon: Icons.users,
  },
  {
    title: "Gestão de IA",
    href: "/admin/ai",
    icon: Icons.bot,
  },
  {
    title: "Chat & Suporte",
    href: "/admin/chat",
    icon: Icons.message,
    badge: "Em breve",
  },
  {
    title: "Relatórios",
    href: "/admin/reports",
    icon: Icons.fileText,
  },
  {
    title: "Configurações",
    href: "/admin/settings",
    icon: Icons.settings,
  },
]

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administração
          </h2>
          <div className="space-y-1">
            {adminSidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
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
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export as both named and default for compatibility
export { AdminSidebar as Sidebar }