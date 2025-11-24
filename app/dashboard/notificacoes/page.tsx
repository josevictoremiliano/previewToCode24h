"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

export default function NotificacoesPage() {
  const {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
  } = useNotifications()

  const getNotificationStyles = (type: "info" | "success" | "warning" | "error") => {
    switch (type) {
      case "success":
        return {
          icon: Icons.check,
          color: "text-emerald-600 dark:text-emerald-500",
          bg: "bg-emerald-100/50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-800",
        }
      case "warning":
        return {
          icon: Icons.alertTriangle,
          color: "text-amber-600 dark:text-amber-500",
          bg: "bg-amber-100/50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
        }
      case "error":
        return {
          icon: Icons.x,
          color: "text-rose-600 dark:text-rose-500",
          bg: "bg-rose-100/50 dark:bg-rose-900/20",
          border: "border-rose-200 dark:border-rose-800",
        }
      default:
        return {
          icon: Icons.info,
          color: "text-blue-600 dark:text-blue-500",
          bg: "bg-blue-100/50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
        }
    }
  }

  interface NotificationCardProps {
    notification: {
      id: string
      type: "info" | "success" | "warning" | "error"
      title: string
      message: string
      read: boolean
      createdAt: string
      project?: {
        id: string
        siteName: string
        status: string
      }
    }
  }

  const NotificationCard = ({ notification }: NotificationCardProps) => {
    const styles = getNotificationStyles(notification.type)
    const Icon = styles.icon

    return (
      <div
        className={cn(
          "group relative flex gap-4 rounded-2xl border p-5 transition-all duration-200 hover:shadow-md",
          !notification.read
            ? "bg-white dark:bg-card border-l-4 border-l-primary shadow-sm"
            : "bg-gray-50/50 dark:bg-card/50 border-transparent hover:bg-white dark:hover:bg-card hover:border-border"
        )}
      >
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
          styles.bg,
          styles.color
        )}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className={cn(
                "text-base font-semibold leading-none tracking-tight",
                !notification.read ? "text-foreground" : "text-muted-foreground"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {!notification.read && (
                <span className="flex h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2">
              {notification.project && (
                <Button size="sm" variant="outline" className="h-8 text-xs font-medium rounded-full" asChild>
                  <a href={`/dashboard/sites/${notification.project.id}`}>
                    Ver Projeto
                  </a>
                </Button>
              )}
              {(notification.title.toLowerCase().includes('ticket') ||
                notification.message.toLowerCase().includes('ticket') ||
                notification.message.toLowerCase().includes('suporte')) && (
                  <Button size="sm" variant="outline" className="h-8 text-xs font-medium rounded-full" asChild>
                    <a href={notification.project?.id ? `/dashboard/suporte/${notification.project.id}` : '/dashboard/suporte'}>
                      Abrir Ticket
                    </a>
                  </Button>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full"
                  onClick={() => markAsRead(notification.id)}
                  title="Marcar como lida"
                >
                  <Icons.check className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                onClick={() => deleteNotification(notification.id)}
                title="Excluir"
              >
                <Icons.trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie suas atualizações e alertas do sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={markAllAsRead}
              disabled={isLoading}
              className="rounded-full shadow-sm"
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Icons.checkCheck className="h-4 w-4 mr-2" />
              )}
              Marcar tudo como lido
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={clearAllRead}
            disabled={isLoading || readNotifications.length === 0}
            className="rounded-full"
          >
            {isLoading ? (
              <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Icons.trash className="h-4 w-4 mr-2" />
            )}
            Limpar lidas
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Icons.bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-3xl font-bold tracking-tight">{notifications.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Icons.bellRing className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Não lidas</p>
              <p className="text-3xl font-bold tracking-tight">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Icons.check className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lidas</p>
              <p className="text-3xl font-bold tracking-tight">{readNotifications.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-transparent p-0 h-auto gap-2">
          <TabsTrigger
            value="all"
            className="rounded-full border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 px-4 py-2"
          >
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="rounded-full border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 px-4 py-2"
          >
            Não lidas ({unreadCount})
          </TabsTrigger>
          <TabsTrigger
            value="read"
            className="rounded-full border border-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 px-4 py-2"
          >
            Lidas ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 animate-in fade-in-50 duration-300">
          {notifications.length > 0 ? (
            <div className="grid gap-3">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Icons.bell}
              title="Nenhuma notificação"
              description="Quando tivermos atualizações sobre seus projetos, elas aparecerão aqui."
            />
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4 animate-in fade-in-50 duration-300">
          {unreadNotifications.length > 0 ? (
            <div className="grid gap-3">
              {unreadNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Icons.checkCheck}
              title="Tudo em dia!"
              description="Você leu todas as suas notificações."
            />
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4 animate-in fade-in-50 duration-300">
          {readNotifications.length > 0 ? (
            <div className="grid gap-3">
              {readNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Icons.bellRing}
              title="Histórico vazio"
              description="As notificações que você já leu aparecerão aqui."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-3xl bg-gray-50/50 dark:bg-card/50">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
    </div>
  )
}