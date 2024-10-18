const request = require('supertest');
const express = require('express');
const cors = require('cors'); // Import the cors module
const app = require('./vm.js'); // Import the main app

// Helper function to set up a new app for each test case
const createTestApp = (volunteers = [], events = []) => {
    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());

    testApp.get('/match', (req, res) => {
        let matchedVolunteer = null;
        let matchedEvent = null;

        // Check for no events
        if (events.length === 0) {
            return res.json({
                volunteerName: "No match found",
                matchedEvent: ""
            });
        }

        // Check for no volunteers
        if (volunteers.length === 0) {
            return res.json({
                volunteerName: "No match found",
                matchedEvent: ""
            });
        }

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

    return testApp;
};

describe('Integration Test: Frontend and Backend Connectivity', () => {
    it('should return matched volunteer and event when a match is found', async () => {
        const response = await request(app)  // Use the actual backend app
            .post('/match')  // Assuming your frontend calls this endpoint
            .send({
                volunteers: [
                    { name: "James Smith", skills: ["Cardiology", "General"] }
                ],
                events: [
                    { name: "Cardiology Department", requiredSkills: ["Cardiology"] }
                ]
            });

        expect(response.status).toBe(200);  // Expect a successful 200 response
        expect(response.body.volunteerName).toBe("James Smith");
        expect(response.body.matchedEvent).toBe("Cardiology Department");
    });

    it('should return "No match found" if no volunteers match', async () => {
        const response = await request(app)  // Use the actual backend app
            .post('/match')  // Assuming your frontend calls this endpoint
            .send({
                volunteers: [
                    { name: "John Doe", skills: ["Surgery"] }
                ],
                events: [
                    { name: "Cardiology Department", requiredSkills: ["Cardiology"] }
                ]
            });

        expect(response.status).toBe(200);  // Expect a successful 200 response
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });
});

describe('POST /match', () => {
    it('should return "No match found" if there are no events', async () => {
        const response = await request(app)
            .post('/match')  // Use POST instead of GET
            .send({
                volunteers: [
                    { name: "James Smith", skills: ["Cardiology", "General"] }
                ],
                events: []  // Simulate no events
            });
        expect(response.status).toBe(200);
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });

    it('should return "No match found" if there are no volunteers', async () => {
        const response = await request(app)
            .post('/match')  // Use POST instead of GET
            .send({
                volunteers: [],  // Simulate no volunteers
                events: [
                    { name: "Cardiology Department", requiredSkills: ["Cardiology"] }
                ]
            });
        expect(response.status).toBe(200);
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });

    it('should return matched volunteer and event if a match is found', async () => {
        const response = await request(app)
            .post('/match')  // Use POST instead of GET
            .send({
                volunteers: [
                    { name: "James Smith", skills: ["Cardiology", "General"] }
                ],
                events: [
                    { name: "Cardiology Department", requiredSkills: ["Cardiology"] }
                ]
            });
        expect(response.status).toBe(200);  // Expect a successful 200 response
        expect(response.body.volunteerName).toBe("James Smith");
        expect(response.body.matchedEvent).toBe("Cardiology Department");
    });

    it('should return "No match found" if no volunteers have required skills', async () => {
        const response = await request(app)
            .post('/match')  // Use POST instead of GET
            .send({
                volunteers: [
                    { name: "John Doe", skills: ["Surgery"] }
                ],
                events: [
                    { name: "Cardiology Department", requiredSkills: ["Cardiology"] }
                ]
            });
        expect(response.status).toBe(200);  // Expect a successful 200 response
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });
});


describe('GET /match', () => {

    it('should return "No match found" if no volunteers match', async () => {
        const noMatchApp = createTestApp(
            [{ name: "Alice", skills: ["Neurology"] }],
            [{ name: "Cardiology Department", requiredSkills: ["Cardiology"] }]
        );

        const response = await request(noMatchApp).get('/match');
        expect(response.status).toBe(200);
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });

    it('should return "No match found" if there are no volunteers', async () => {
        const noVolunteersApp = createTestApp([], [{ name: "Cardiology Department", requiredSkills: ["Cardiology"] }]);

        const response = await request(noVolunteersApp).get('/match');
        expect(response.status).toBe(200);
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });

    it('should return "No match found" if there are no events', async () => {
        const noEventsApp = createTestApp([{ name: "James Smith", skills: ["Cardiology"] }], []);

        const response = await request(noEventsApp).get('/match');
        expect(response.status).toBe(200);
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });

    it('should return "No match found" if no skills match despite volunteers', async () => {
        const noSkillMatchApp = createTestApp(
            [{ name: "Alice", skills: ["Neurology"] }, { name: "Bob", skills: ["General"] }],
            [{ name: "Cardiology Department", requiredSkills: ["Cardiology"] }]
        );

        const response = await request(noSkillMatchApp).get('/match');
        expect(response.status).toBe(200);
        expect(response.body.volunteerName).toBe("No match found");
        expect(response.body.matchedEvent).toBe("");
    });

    // New test case to cover unmatched events with multiple volunteers
    it('should return a match when a later volunteer matches an event', async () => {
        const multipleVolunteersApp = createTestApp(
            [{ name: "Alice", skills: ["Neurology"] }, { name: "James Smith", skills: ["Cardiology"] }],
            [{ name: "Cardiology Department", requiredSkills: ["Cardiology"] }]
        );

        const response = await request(multipleVolunteersApp).get('/match');
        expect(response.status).toBe(200);
        expect(response.body.volunteerName).toBe("James Smith");
        expect(response.body.matchedEvent).toBe("Cardiology Department");
    });

    // Test case to handle multiple events with overlapping volunteer skills
    it('should return the first matching volunteer for the first event', async () => {
        const multipleEventsApp = createTestApp(
            [{ name: "John Doe", skills: ["Surgery", "Cardiology"] }],
            [
                { name: "Surgery Unit", requiredSkills: ["Surgery"] },
                { name: "Cardiology Department", requiredSkills: ["Cardiology"] }
            ]
        );

        const response = await request(multipleEventsApp).get('/match');
        expect(response.status).toBe(200);
        expect(response.body.volunteerName).toBe("John Doe");
        expect(response.body.matchedEvent).toBe("Surgery Unit");
    });
});
