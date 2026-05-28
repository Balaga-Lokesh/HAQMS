const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'reception1@haqms.com';
  const passwordPlain = 'password123';
  const name = 'Reception Desk';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User with email ${email} already exists (id=${existing.id}).`);
    return;
  }

  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name,
      role: 'RECEPTIONIST',
    },
  });

  console.log(`Created receptionist: ${email} (id=${user.id}) with password: ${passwordPlain}`);
}

main()
  .catch((e) => {
    console.error('Failed to create receptionist:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
