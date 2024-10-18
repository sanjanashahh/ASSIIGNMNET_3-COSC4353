const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors());  // Allow cross-origin requests

// Sample notification data (add database here)
let notifications = [
    { type: 'Assignment', time: Date.now() - 1800000, content: 'New event assigned to you!' },
    { type: 'Update', time: Date.now() - 3600000, content: 'New update for the event tomorrow!' },
    { type: 'Reminder', time: Date.now() - 7200000, content: 'Event starting at 6 PM today!' }
];

// API to serve notifications
app.get('/notifications', (req, res) => {
    res.json(notifications);
});

// API to trigger update notification
app.post('/triggerEventUpdate', (req, res) => {
    const newNotification = {
        type: 'Update',
        time: Date.now(),
        content: 'New update for a event tomorrow!'
    };
    
    // Add new notification to the beginning of the list
    notifications.unshift(newNotification);

    res.json(newNotification);
});

// API to trigger event assignment notification
app.post('/triggerEventAssignment', (req, res) => {
    const newNotification = {
        type: 'Assignment',
        time: Date.now(),
        content: 'New event assigned to you!'
    };
    
    // Add new notification to the beginning of the list
    notifications.unshift(newNotification);

    res.json(newNotification);
});

// API to trigger reminder notification
app.post('/triggerReminder', (req, res) => {
    const newNotification = {
        type: 'Reminder',
        time: Date.now(),
        content: 'Reminder for the event today!'
    };

    // Add new notification to the beginning of the list
    notifications.unshift(newNotification);

    res.json(newNotification);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;