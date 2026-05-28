const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting cleanup: remove patients, doctors, appointments, queue tokens, and non-admin users.');

  // Delete dependent records first
  const deletedQueue = await prisma.queueToken.deleteMany();
  console.log(`Deleted queue tokens: ${deletedQueue.count}`);

  const deletedAppointments = await prisma.appointment.deleteMany();
  console.log(`Deleted appointments: ${deletedAppointments.count}`);

  const deletedPatients = await prisma.patient.deleteMany();
  console.log(`Deleted patients: ${deletedPatients.count}`);

  const deletedDoctors = await prisma.doctor.deleteMany();
  console.log(`Deleted doctors: ${deletedDoctors.count}`);

  // Remove non-admin users (keep ADMIN accounts)
  const deletedUsers = await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
  console.log(`Deleted non-admin users: ${deletedUsers.count}`);

  console.log('Cleanup completed. Only ADMIN users remain.');
}

main()
  .catch((e) => {
    console.error('Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
