import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar usuário administrador
  const adminEmail = 'admin@site24h.com'
  const adminPassword = 'admin123'

  // Verificar se o admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  // Hash da senha
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('✅ Usuário administrador criado:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log(`Role: ADMIN`)
  } else {
    // Atualizar para admin se não for e adicionar senha se não tiver
    const updateData: { role?: string; password?: string } = {}
    if (existingAdmin.role !== 'ADMIN') {
      updateData.role = 'ADMIN'
    }
    if (!existingAdmin.password) {
      updateData.password = hashedPassword
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: updateData
      })
      console.log('✅ Usuário existente atualizado para ADMIN com senha')
      if (updateData.password) {
        console.log(`Password: ${adminPassword}`)
      }
    } else {
      console.log('ℹ️ Usuário administrador já existe e está configurado corretamente')
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })