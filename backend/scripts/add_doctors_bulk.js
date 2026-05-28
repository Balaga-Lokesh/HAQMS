const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating 5 doctor users and doctor records...');

  const passwordPlain = 'password123';
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

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
    // create user
    const user = await prisma.user.create({
      data: {
        email: d.email,
        password: passwordHash,
        name: d.name,
        role: 'DOCTOR',
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        name: d.name,
        specialization: d.specialization,
        department: d.department,
        consultationFee: d.consultationFee,
        experience: d.experience,
      },
    });

    console.log(`Created doctor user: ${d.email} (userId=${user.id}, doctorId=${doctor.id})`);
  }

  console.log('Done. Password for created doctor users is:', passwordPlain);
}

main()
  .catch((e) => {
    console.error('Failed to create doctors:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
