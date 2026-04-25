const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { alias: 'emilysastranova' },
      data: { role: 'ADMIN' }
    });
    console.log('Admin granted to:', user.name);
  } catch (e) {
    console.error('Error updating user:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
