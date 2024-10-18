const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

const validateMatchRequest = [
    body('volunteers').isArray().withMessage('Volunteers should be an array'),
    body('volunteers.*.name').isString().withMessage('Volunteer name should be a string'),
    body('volunteers.*.skills').isArray().withMessage('Volunteer skills should be an array'),
    body('events').isArray().withMessage('Events should be an array'),
    body('events.*.name').isString().withMessage('Event name should be a string'),
    body('events.*.requiredSkills').isArray().withMessage('Event requiredSkills should be an array'),
];

// Matching endpoint with validation
app.post('/match', validateMatchRequest, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { volunteers, events } = req.body;
    let matchedVolunteer = null;
    let matchedEvent = null;

    // Check for no events
    if (!events || events.length === 0) {
        return res.json({
            volunteerName: "No match found",
            matchedEvent: ""
        });
    }

    // Check for no volunteers
    if (!volunteers || volunteers.length === 0) {
        return res.json({
            volunteerName: "No match found",
            matchedEvent: ""
        });
    }

    // Matching logic
    for (const event of events) {
        for (const volunteer of volunteers) {
            if (volunteer.skills.includes(event.requiredSkills[0])) {
                matchedVolunteer = volunteer.name;
                matchedEvent = event.name;
                break; // Break the inner loop when a match is found
            }
        }
        if (matchedVolunteer) break; // Break the outer loop when a match is found
    }

    res.json({
        volunteerName: matchedVolunteer || "No match found",
        matchedEvent: matchedEvent || ""
    });
});

module.exports = app;
