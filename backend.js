const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage(); // Use memory storage for testing
const upload = multer({ storage: storage });

let volunteerProfiles = [
    {
        fullName: 'John Doe',
        address1: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zipcode: '77001',
        skills: ['Technological Proficiency'],
        preferences: ['Radiology'],
        availability: ['2024-01-01'],
        summary: 'Excited to volunteer!'
    }
];

app.get('/volunteer', (req, res) => {
    res.json(volunteerProfiles[0]); // Return a default profile
});

// Validation middleware
const validateVolunteerForm = [
    body('fullName').notEmpty().withMessage('Full name is required').isLength({ max: 50 }).withMessage('Full name should be less than 50 characters'),
    body('address1').notEmpty().withMessage('Address 1 is required').isLength({ max: 100 }).withMessage('Address 1 should be less than 100 characters'),
    body('city').notEmpty().withMessage('City is required').isLength({ max: 100 }).withMessage('City should be less than 100 characters'),
    body('state').notEmpty().withMessage('State is required').isLength({ min: 2, max: 2 }).withMessage('State should be a 2-character abbreviation'),
    body('zipcode').notEmpty().withMessage('Zipcode is required').matches(/^[0-9]{5}(-[0-9]{4})?$/).withMessage('Zipcode should be a valid format'),
    body('summary').optional().isLength({ max: 300 }).withMessage('Summary should be less than 300 characters'),
    body('availability').isArray({ min: 1 }).withMessage('At least one availability date should be selected'),
];

// Form submission handler
app.post('/volunteer', upload.single('image-file'), validateVolunteerForm, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(err => err.msg) });
    }

    const { fullName, address1, address2, city, state, zipcode, skills, preferences, summary, availability } = req.body;

    const newProfile = {
        fullName,
        address1,
        address2: address2 || '',
        city,
        state,
        zipcode,
        skills: Array.isArray(skills) ? skills : [skills],
        preferences: Array.isArray(preferences) ? preferences : [preferences],
        availability: Array.isArray(availability) ? availability : [availability],
        summary: summary || '',
        imageUrl: req.file ? req.file.originalname : 'uploads/default.png'
    };

    volunteerProfiles.push(newProfile);
    res.json({ message: "Profile updated successfully!", profile: newProfile });
});

// Export the app and server
const server = app.listen(4000, () => {
    console.log('Server is running on port 3000');
});

module.exports = { app, volunteerProfiles };