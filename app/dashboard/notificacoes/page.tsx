"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useNotifications } from "@/hooks/use-notifications"

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

  const getNotificationIcon = (type: "info" | "success" | "warning" | "error") => {
    switch (type) {
      case "success":
        return <Icons.check className="h-5 w-5 text-green-600" />
      case "warning":
        return <Icons.alertTriangle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <Icons.x className="h-5 w-5 text-red-600" />
      default:
        return <Icons.info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationBadgeVariant = (type: "info" | "success" | "warning" | "error") => {
    switch (type) {
      case "success":
        return "default" as const
      case "warning":
        return "secondary" as const
      case "error":
        return "destructive" as const
      default:
        return "outline" as const
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

  const NotificationCard = ({ notification }: NotificationCardProps) => (
    <Card className={`transition-all duration-200 ${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{notification.title}</h4>
              <div className="flex items-center gap-2">
                <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs">
                  {notification.type === 'success' && 'Sucesso'}
                  {notification.type === 'warning' && 'Atenção'}
                  {notification.type === 'error' && 'Erro'}
                  {notification.type === 'info' && 'Info'}
                </Badge>
                {!notification.read && (
                  <div className="h-2 w-2 bg-primary rounded-full" />
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
              
              <div className="flex items-center gap-2">
                {notification.project && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/dashboard/sites/${notification.project.id}`}>
                      Ver Site
                    </a>
                  </Button>
                )}
                
                {!notification.read && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Icons.check className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => deleteNotification(notification.id)}
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Acompanhe atualizações dos seus projetos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Icons.checkCheck className="h-4 w-4 mr-2" />
              )}
              Marcar todas como lidas
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={clearAllRead}
            disabled={isLoading || readNotifications.length === 0}
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

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icons.bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icons.bellRing className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Não lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icons.check className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{readNotifications.length}</p>
                <p className="text-sm text-muted-foreground">Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificações */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Não lidas ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Lidas ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icons.bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                <p className="text-muted-foreground text-center">
                  Quando tivermos atualizações sobre seus projetos, elas aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length > 0 ? (
            <div className="space-y-4">
              {unreadNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icons.checkCheck className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Tudo em dia!</h3>
                <p className="text-muted-foreground text-center">
                  Você não tem notificações não lidas.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {readNotifications.length > 0 ? (
            <div className="space-y-4">
              {readNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icons.bellRing className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma notificação lida</h3>
                <p className="text-muted-foreground text-center">
                  As notificações que você já leu aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}