const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    console.log('🔧 Corrigindo senha do admin...');

    // Buscar o usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { 
        email: 'admin@previewtocode.com',
        role: 'ADMIN' 
      }
    });

    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }

    console.log('👤 Admin encontrado:', adminUser.email);

    // Gerar hash da senha 'admin123'
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Atualizar a senha no banco
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    });

    console.log('✅ Senha do admin atualizada com hash!');
    console.log('\n📋 Credenciais de login:');
    console.log('  Email: admin@previewtocode.com');
    console.log('  Senha: admin123');
    console.log('\n🚀 Agora você pode fazer login normalmente!');

  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();