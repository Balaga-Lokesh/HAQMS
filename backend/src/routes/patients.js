const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Helpers
const isValidPhone = (phone) => /^[0-9+\-\s()]{7,15}$/.test(phone);
const isValidAge = (age) => Number.isInteger(age) && age > 0 && age <= 150;

// GET /api/patients
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, gender } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 5, 100); // cap at 100
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (gender && gender !== 'All') {
      where.gender = gender;
    }

    const [patients, totalPatients] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    res.json({
      success: true,
      patients,
      pagination: {
        page,
        limit,
        totalPatients,
        totalPages: Math.ceil(totalPatients / limit),
      },
    });
  } catch (error) {
    console.error('Patient fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          include: {
            doctor: {
              select: { id: true, name: true, specialization: true },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Patient fetch by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// POST /api/patients
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, email, phoneNumber, age, gender, medicalHistory } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !age || !gender) {
      return res.status(400).json({
        error: 'Name, phoneNumber, age, and gender are required.',
      });
    }

    // Validate phone format
    if (!isValidPhone(phoneNumber)) {
      return res.status(400).json({
        error: 'Invalid phone number format.',
      });
    }

    // Validate age
    const parsedAge = parseInt(age);
    if (!isValidAge(parsedAge)) {
      return res.status(400).json({
        error: 'Age must be a valid number between 1 and 150.',
      });
    }

    // Validate gender
    const allowedGenders = ['MALE', 'FEMALE', 'OTHER'];
    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({
        error: `Gender must be one of: ${allowedGenders.join(', ')}`,
      });
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        email: email || null,
        phoneNumber,
        age: parsedAge,
        gender,
        medicalHistory: medicalHistory || null,
      },
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error('Patient create error:', error);
    res.status(500).json({ error: 'Failed to register patient' });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await prisma.patient.delete({ where: { id } });

    res.json({ message: `Successfully deleted patient ${patient.name}` });
  } catch (error) {
    console.error('Patient delete error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

module.exports = router;