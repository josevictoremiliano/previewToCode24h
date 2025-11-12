import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface NotificationPayload {
  type: string
  title: string
  message: string
  projectId?: string
}

/**
 * Envia notificação para um usuário
 */
export async function notifyUser(userId: string, payload: NotificationPayload): Promise<void> {
  try {
    console.log(`📧 Enviando notificação para usuário ${userId}:`, payload.title)

    // Salvar notificação no banco de dados
    const notification = await prisma.notification.create({
      data: {
        userId,
        projectId: payload.projectId || null,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        read: false
      }
    })

    console.log('✅ Notificação salva no banco:', notification.id)

    // TODO: Implementar envio de email
    // await sendEmail(userId, payload)

    // TODO: Implementar push notifications
    // await sendPushNotification(userId, payload)

    // TODO: Implementar WebSocket para notificações em tempo real
    // await sendRealtimeNotification(userId, payload)

  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error)
    throw new Error(`Falha ao enviar notificação: ${error.message}`)
  }
}

/**
 * Busca notificações de um usuário
 */
export async function getUserNotifications(
  userId: string, 
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<any[]> {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false })
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    return notifications
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error)
    throw new Error(`Falha ao buscar notificações: ${error.message}`)
  }
}

/**
 * Marca notificação como lida
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId // Garantir que o usuário só pode marcar suas próprias notificações
      },
      data: {
        read: true
      }
    })

    console.log('✅ Notificação marcada como lida:', notificationId)
  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error)
    throw new Error(`Falha ao marcar notificação: ${error.message}`)
  }
}

/**
 * Marca todas as notificações de um usuário como lidas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    })

    console.log('✅ Todas as notificações marcadas como lidas para usuário:', userId)
  } catch (error) {
    console.error('❌ Erro ao marcar todas as notificações como lidas:', error)
    throw new Error(`Falha ao marcar notificações: ${error.message}`)
  }
}

/**
 * Conta notificações não lidas de um usuário
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    })

    return count
  } catch (error) {
    console.error('❌ Erro ao contar notificações não lidas:', error)
    return 0
  }
}

// Função para envio de email (mock)
async function sendEmail(userId: string, payload: NotificationPayload): Promise<void> {
  // TODO: Implementar com SendGrid, Resend, ou similar
  console.log(`📧 [MOCK] Email enviado para usuário ${userId}:`, payload.title)
}

// Função para push notifications (mock)
async function sendPushNotification(userId: string, payload: NotificationPayload): Promise<void> {
  // TODO: Implementar com Firebase Cloud Messaging ou similar
  console.log(`🔔 [MOCK] Push notification enviada para usuário ${userId}:`, payload.title)
}

// Função para notificações em tempo real (mock)
async function sendRealtimeNotification(userId: string, payload: NotificationPayload): Promise<void> {
  // TODO: Implementar com WebSockets ou Server-Sent Events
  console.log(`⚡ [MOCK] Notificação em tempo real enviada para usuário ${userId}:`, payload.title)
}

const notificationService = {
  notifyUser,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
}

export default notificationService