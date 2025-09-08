const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');
const bcrypt = require('bcrypt');

// Create a new institution
router.post('/', async (req, res) => {
    const { institutionName, institutionType, onboardingGrade, province, address, email, contactNumber, password } = req.body;

    try {
        let institution = await Institution.findOne({ institutionName });
        if (institution) return res.status(400).json({ error: 'Institution already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newInstitution = new Institution({ 
            institutionName, 
            institutionType, 
            onboardingGrade, 
            province, 
            address, 
            email, 
            contactNumber,
            password: hashedPassword 
        });

        await newInstitution.save();
        res.status(201).json(newInstitution);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all institutions
router.get('/', async (req, res) => {
  try {
    const institutions = await Institution.find();
    res.json(institutions || []); // Ensure it's always an array
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single institution by ID
router.get('/:id', async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json(institution);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an institution
router.put('/:id', async (req, res) => {
    const { institutionName, institutionType, onboardingGrade, province, address, email, contactNumber, password } = req.body;

    try {
        let institution = await Institution.findById(req.params.id);
        if (!institution) {
            return res.status(404).json({ error: 'Institution not found' });
        }

        // Check if another institution with the same name exists
        const existingInstitution = await Institution.findOne({ 
            institutionName, 
            _id: { $ne: req.params.id } 
        });
        
        if (existingInstitution) {
            return res.status(400).json({ error: 'An institution with this name already exists' });
        }

        institution.institutionName = institutionName;
        institution.institutionType = institutionType;
        institution.onboardingGrade = onboardingGrade;
        institution.province = province;
        institution.address = address;
        institution.email = email;
        institution.contactNumber = contactNumber;

        // Update password if provided
        if (password) {
            institution.password = await bcrypt.hash(password, 10);
        }

        await institution.save();
        res.json(institution);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete an institution
router.delete('/:id', async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    await Institution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Institution deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Institution login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const institution = await Institution.findOne({ email });
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const isMatch = await bcrypt.compare(password, institution.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', institution: { id: institution._id, name: institution.institutionName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;