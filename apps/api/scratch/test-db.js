const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    const users = await prisma.user.count();
    console.log('Count of users:', users);
  } catch (e) {
    console.error('❌ Database connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
