const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.queueToken.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.user.deleteMany({});

  const admin = await prisma.user.create({
    data: {
      email: 'admin@haqms.com',
      password: passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      email: 'reception1@haqms.com',
      password: passwordHash,
      name: 'Reception Desk',
      role: 'RECEPTIONIST',
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor1@haqms.com',
      password: passwordHash,
      name: 'Dr. Meredith Grey',
      role: 'DOCTOR',
    },
  });

  const cardiologyDoctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      name: 'Dr. Meredith Grey',
      specialization: 'Cardiology',
      department: 'Medicine',
      consultationFee: 150,
      experience: 12,
    },
  });

  const neurologyDoctor = await prisma.doctor.create({
    data: {
      name: 'Dr. Alex Morgan',
      specialization: 'Neurology',
      department: 'Medicine',
      consultationFee: 200,
      experience: 10,
    },
  });

  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'Clark Kent',
        email: 'clark.kent@haqms.com',
        phoneNumber: '5551000001',
        age: 32,
        gender: 'Male',
        medicalHistory: null,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Bruce Wayne',
        email: 'bruce.wayne@haqms.com',
        phoneNumber: '5551000002',
        age: 38,
        gender: 'Male',
        medicalHistory: 'Past orthopedic review; requires ongoing monitoring.',
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Diana Prince',
        email: 'diana.prince@haqms.com',
        phoneNumber: '5551000003',
        age: 30,
        gender: 'Female',
        medicalHistory: 'Annual wellness check; no active concerns.',
      },
    }),
  ]);

  const [clark, bruce, diana] = patients;

  const now = new Date();
  const oneHour = 60 * 60 * 1000;

  await prisma.appointment.createMany({
    data: [
      {
        patientId: clark.id,
        doctorId: cardiologyDoctor.id,
        appointmentDate: new Date(now.getTime() + oneHour),
        reason: 'Annual cardiac screening',
        status: 'PENDING',
      },
      {
        patientId: bruce.id,
        doctorId: cardiologyDoctor.id,
        appointmentDate: new Date(now.getTime() + 2 * oneHour),
        reason: 'Follow-up consultation',
        status: 'COMPLETED',
      },
      {
        patientId: diana.id,
        doctorId: neurologyDoctor.id,
        appointmentDate: new Date(now.getTime() + 3 * oneHour),
        reason: 'Routine evaluation',
        status: 'PENDING',
      },
    ],
  });

  await prisma.queueToken.createMany({
    data: [
      {
        tokenNumber: 1,
        patientId: clark.id,
        doctorId: cardiologyDoctor.id,
        appointmentId: null,
        status: 'WAITING',
      },
      {
        tokenNumber: 2,
        patientId: bruce.id,
        doctorId: cardiologyDoctor.id,
        appointmentId: null,
        status: 'CALLING',
      },
      {
        tokenNumber: 1,
        patientId: diana.id,
        doctorId: neurologyDoctor.id,
        appointmentId: null,
        status: 'WAITING',
      },
    ],
  });

  console.log('Seed completed successfully.');
  console.log('Demo users: admin@haqms.com, reception1@haqms.com, doctor1@haqms.com');
  console.log('Password for all demo users: password123');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });