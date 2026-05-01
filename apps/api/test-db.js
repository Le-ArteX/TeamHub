const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected successfully!');
    const usersCount = await prisma.user.count();
    console.log('Users count:', usersCount);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
