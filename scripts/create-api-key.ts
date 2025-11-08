import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const prisma = new PrismaClient()

async function main() {
  // Buscar um usuário
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.log("Nenhum usuário encontrado. Crie um usuário primeiro.")
    return
  }

  console.log(`Criando API Key para: ${user.email}`)

  // Gerar chave aleatória
  const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`
  const hashedKey = await bcrypt.hash(rawKey, 12)
  
  // Criar preview da chave (primeiros 8 e últimos 4 caracteres)
  const keyPreview = `${rawKey.substring(0, 12)}...${rawKey.slice(-4)}`

  const apiKey = await prisma.apiKey.create({
    data: {
      name: "n8n Integration",
      key: hashedKey,
      keyPreview,
      userId: user.id,
      permissions: {
        "projects.read": true,
        "projects.update": true,
        "notifications.create": true
      },
    }
  })

  console.log(`✅ API Key criada: ${apiKey.name}`)
  console.log(`🔑 Key: ${rawKey}`)
  console.log(`📋 Preview: ${keyPreview}`)
  console.log(`\n📖 Use esta chave no n8n:`)
  console.log(`   Header: X-API-Key: ${rawKey}`)
  console.log(`   Ou: Authorization: Bearer ${rawKey}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })