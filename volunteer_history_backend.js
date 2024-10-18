const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Allow cross-origin requests

// Hardcoded volunteer history data (add database here)
const volunteerHistory = [
    {
        eventName: 'Annual Meeting',
        eventDate: '2024-09-15',
        location: 'Houston',
        department: 'Neurology',
        skill: 'Attention to Detail',
        status: 'Completed'
    },
    {
        eventName: 'CPR Training',
        eventDate: '2024-08-25',
        location: 'Pearland',
        department: 'Cardiology',
        skill: 'Cardiac Knowledge',
        status: 'Completed'
    },
    {
        eventName: 'Full body imaging',
        eventDate: '2024-08-13',
        location: 'Pasadena',
        department: 'Radiology',
        skill: 'Technological Proficiency',
        status: 'Completed'
    }
];

// API endpoint to get volunteer history
app.get('/api/volunteer-history', (req, res) => {
    res.json(volunteerHistory);
});

app.post('/api/triggerVolunteerHistory', (req, res) => {
    const newVolunteerHistory = {
        eventName: 'Blood Donation',
        eventDate: '2024-10-11',
        location: 'Houston',
        department: 'Cardiology',
        skill: 'Hard Working',
        status: 'Pending'
    };

    volunteerHistory.unshift(newVolunteerHistory);

    res.json(newVolunteerHistory);
})

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;