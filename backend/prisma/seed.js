const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting production seed...');

  const passwordPlain = 'password123';
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  // Clear existing demo data
  await prisma.queueToken.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN',
      },
    },
  });

  console.log('Old demo data cleared.');

  // Admin
  const adminExists = await prisma.user.findUnique({
    where: {
      email: 'admin@haqms.com',
    },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: 'admin@haqms.com',
        password: passwordHash,
        name: 'System Admin',
        role: 'ADMIN',
      },
    });

    console.log('Admin created.');
  }

  // Receptionist
  const receptionistExists = await prisma.user.findUnique({
    where: {
      email: 'reception1@haqms.com',
    },
  });

  if (!receptionistExists) {
    await prisma.user.create({
      data: {
        email: 'reception1@haqms.com',
        password: passwordHash,
        name: 'Reception Desk',
        role: 'RECEPTIONIST',
      },
    });

    console.log('Receptionist created.');
  }

  // Doctors
  const doctors = [
    {
      name: 'Dr. Jane Smith',
      email: 'doctor.jane@haqms.com',
      specialization: 'Cardiology',
      department: 'Medicine',
      consultationFee: 150,
      experience: 8,
    },
    {
      name: 'Dr. Alan Turing',
      email: 'doctor.alan@haqms.com',
      specialization: 'Neurology',
      department: 'Medicine',
      consultationFee: 200,
      experience: 15,
    },
    {
      name: 'Dr. Priya Patel',
      email: 'doctor.priya@haqms.com',
      specialization: 'Pediatrics',
      department: 'Pediatrics',
      consultationFee: 120,
      experience: 7,
    },
    {
      name: 'Dr. Carlos Mendez',
      email: 'doctor.carlos@haqms.com',
      specialization: 'Orthopedics',
      department: 'Surgery',
      consultationFee: 130,
      experience: 10,
    },
    {
      name: 'Dr. Li Wei',
      email: 'doctor.li@haqms.com',
      specialization: 'General Medicine',
      department: 'General',
      consultationFee: 100,
      experience: 12,
    },
  ];

  for (const d of doctors) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: d.email,
      },
    });

    if (existingUser) {
      console.log(`Doctor already exists: ${d.email}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: d.email,
        password: passwordHash,
        name: d.name,
        role: 'DOCTOR',
      },
    });

    await prisma.doctor.create({
      data: {
        userId: user.id,
        name: d.name,
        specialization: d.specialization,
        department: d.department,
        consultationFee: d.consultationFee,
        experience: d.experience,
      },
    });

    console.log(`Doctor created: ${d.email}`);
  }

  console.log('Production seed completed successfully.');
  console.log('Password for all users: password123');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

