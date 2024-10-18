const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { check, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
    res.render('EMF');
});

// Store submitted events in-memory (for testing purposes, use a database in production)
const submittedEvents = new Set();

// Validation middleware
const validateEventForm = [
    check('eventName')
        .notEmpty().withMessage('Event name is required')
        .isLength({ max: 100 }).withMessage('Event name must be 100 characters or fewer'),
    check('eventDescription')
        .notEmpty().withMessage('Event description is required'),
    check('eventLocation')
        .notEmpty().withMessage('Event location is required'),
    check('skills')
        .notEmpty().withMessage('At least one skill is required'),
    check('urgency')
        .notEmpty().withMessage('Urgency level is required'),
    check('eventDate')
        .notEmpty().withMessage('Event date is required')
        .isISO8601().withMessage('Event date must be a valid date'),
];

// Handle form submission
app.post('/submit-form', validateEventForm, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { eventName } = req.body;

    // Check for duplicate submissions
    if (submittedEvents.has(eventName)) {
        return res.status(400).json({
            errors: [{ msg: 'Duplicate event submissions are not allowed' }],
        });
    }

    // Store the event name to simulate database uniqueness constraint
    submittedEvents.add(eventName);

    // Log the request body for debugging
    console.log('Form Data:', req.body);

    // Process the form submission
    res.send('Form submitted successfully!');
});


// Start the server and export it
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the server instance for testing
module.exports = { app, server };
