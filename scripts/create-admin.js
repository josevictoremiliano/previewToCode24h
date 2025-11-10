const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Hash da senha 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('Admin já existe:', existingAdmin.email)
      return existingAdmin
    }

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@site24h.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    })

    console.log('Admin criado com sucesso!')
    console.log('Email: admin@site24h.com')
    console.log('Senha: admin123')
    console.log('Admin ID:', admin.id)

    return admin
  } catch (error) {
    console.error('Erro ao criar admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()