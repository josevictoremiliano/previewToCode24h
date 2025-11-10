import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Buscar um usuário
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.log("Nenhum usuário encontrado. Crie um usuário primeiro.")
    return
  }

  console.log(`Criando projeto de exemplo para: ${user.email}`)

  // Criar um projeto de exemplo
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: "Loja de Roupas Online",
      slogan: "Estilo e qualidade para todos",
      siteType: "E-commerce",
      niche: "Moda",
      status: "PREVIEW",
      description: "Uma loja online moderna para venda de roupas femininas e masculinas",
      targetAudience: "Jovens adultos de 18-35 anos",
      contactEmail: "contato@lojaderoupas.com",
      contactPhone: "(11) 99999-9999",
      primaryColor: "#2563eb",
      secondaryColor: "#f59e0b",
      style: "moderno",
    }
  })

  console.log(`✅ Projeto criado: ${project.name} (ID: ${project.id})`)

  // Criar uma notificação relacionada ao projeto
  await prisma.notification.create({
    data: {
      userId: user.id,
      projectId: project.id,
      type: "success",
      title: "Preview do site pronto!",
      message: `Seu site "${project.name}" está pronto para revisão. Clique para visualizar o preview.`,
      read: false,
    }
  })

  console.log("✅ Notificação criada para o projeto")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })