import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Buscar um usuário para criar notificações de exemplo
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.log("Nenhum usuário encontrado. Crie um usuário primeiro.")
    return
  }

  console.log(`Criando notificações para o usuário: ${user.email}`)

  // Criar notificações de exemplo
  const notifications = [
    {
      userId: user.id,
      type: "success",
      title: "Bem-vindo ao Site 24h!",
      message: "Obrigado por se cadastrar! Sua jornada para ter um site incrível começa aqui.",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
    {
      userId: user.id,
      type: "info",
      title: "Dica: Personalize seu perfil",
      message: "Que tal adicionar uma foto e completar suas informações de perfil?",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      userId: user.id,
      type: "success",
      title: "Sistema atualizado",
      message: "Melhoramos a velocidade de criação dos sites em 40%. Experimente criar um novo site!",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
  ]

  // Verificar se já existem projects para criar notificações relacionadas
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    take: 2,
  })

  if (projects.length > 0) {
    notifications.push({
      userId: user.id,
      type: "info",
      title: "Projeto em andamento",
      message: `Seu site "${projects[0].name}" está sendo desenvolvido. Em breve você receberá o preview!`,
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    })
  }

  if (projects.length > 1 && projects[1].status === "COMPLETED") {
    notifications.push({
      userId: user.id,
      type: "success",
      title: "Site finalizado!",
      message: `Seu site "${projects[1].name}" foi finalizado e está disponível!`,
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    })
  }

  // Criar as notificações
  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    })
  }

  console.log(`✅ Criadas ${notifications.length} notificações de exemplo`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })