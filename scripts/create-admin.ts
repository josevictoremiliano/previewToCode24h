/**
 * Script para criar ou promover um usuário para ADMIN
 * Execute com: npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🚀 Iniciando script de criação de usuário admin...')

    // Verificar se já existe um admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log(`✅ Já existe um usuário admin: ${existingAdmin.email}`)
      return
    }

    // Verificar se existe o email admin@site24horas.com
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@site24horas.com' }
    })

    if (adminUser) {
      // Promover usuário existente para admin
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'ADMIN' }
      })
      console.log(`✅ Usuário ${adminUser.email} promovido para ADMIN`)
    } else {
      // Criar novo usuário admin
      const hashedPassword = await bcrypt.hash('admin123456', 10)
      
      adminUser = await prisma.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@site24horas.com',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      })
      console.log(`✅ Novo usuário admin criado: ${adminUser.email}`)
      console.log(`🔑 Senha padrão: admin123456`)
      console.log(`⚠️  Altere a senha após o primeiro login!`)
    }

    console.log('\n📊 Resumo:')
    console.log(`ID: ${adminUser.id}`)
    console.log(`Nome: ${adminUser.name}`)
    console.log(`Email: ${adminUser.email}`)
    console.log(`Role: ${adminUser.role}`)
    console.log(`Criado em: ${adminUser.createdAt}`)

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
createAdminUser()