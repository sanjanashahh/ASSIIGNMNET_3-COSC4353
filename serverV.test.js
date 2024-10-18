const request = require('supertest');
const { app, server } = require('../serverV.cjs'); // Adjust import to match your export

// Test for the POST /submit-form route
describe('POST /submit-form', () => {
    it('should return 200 for valid input', async () => {
        const response = await request(app)
            .post('/submit-form')
            .send({
                eventName: 'Sample Event',
                eventDescription: 'This is a sample event.',
                eventLocation: 'Houston',
                skills: 'Programming',
                urgency: 'High',
                eventDate: '2024-10-15'
            });
        expect(response.status).toBe(200);
        expect(response.text).toBe('Form submitted successfully!');
    });

    it('should return 400 for missing required fields', async () => {
        const response = await request(app)
            .post('/submit-form')
            .send({}); // No fields sent
        expect(response.status).toBe(400);
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'Event name is required' })
        );
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'Event description is required' })
        );
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'Event location is required' })
        );
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'At least one skill is required' })
        );
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'Urgency level is required' })
        );
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'Event date is required' })
        );
    });

    it('should return 400 for invalid event date', async () => {
        const response = await request(app)
            .post('/submit-form')
            .send({
                eventName: 'Sample Event',
                eventDescription: 'This is a sample event.',
                eventLocation: 'Houston',
                skills: 'Programming',
                urgency: 'High',
                eventDate: 'invalid-date'
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'Event date must be a valid date' })
        );
    });

    it('should return 400 for event name exceeding character limit', async () => {
        const longEventName = 'A'.repeat(101); // 101 characters long
        const response = await request(app)
            .post('/submit-form')
            .send({
                eventName: longEventName,
                eventDescription: 'This is a sample event.',
                eventLocation: 'Houston',
                skills: 'Programming',
                urgency: 'High',
                eventDate: '2024-10-15'
            });
        expect(response.status).toBe(400);
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'Event name must be 100 characters or fewer' })
        );
    });

    it('should return 400 for duplicate submissions', async () => {
        // First submission - should succeed
        const firstResponse = await request(app)
            .post('/submit-form')
            .send({
                eventName: 'Duplicate Event',
                eventDescription: 'Testing duplicate event submissions.',
                eventLocation: 'Houston',
                skills: 'Testing',
                urgency: 'Medium',
                eventDate: '2024-10-20'
            });
        
        expect(firstResponse.status).toBe(200);
        expect(firstResponse.text).toBe('Form submitted successfully!');

        // Second submission - should fail due to duplicate
        const secondResponse = await request(app)
            .post('/submit-form')
            .send({
                eventName: 'Duplicate Event', // Same event name
                eventDescription: 'Testing duplicate event submissions.',
                eventLocation: 'Houston',
                skills: 'Testing',
                urgency: 'Medium',
                eventDate: '2024-10-20'
            });
        
        expect(secondResponse.status).toBe(400);
        expect(secondResponse.body.errors).toContainEqual(
            expect.objectContaining({ msg: 'Duplicate event submissions are not allowed' })
        );
    });
});

// Integration Test: Frontend to Backend Communication
describe('Integration Test: Frontend to Backend Communication', () => {
    it('should successfully submit form data and receive a confirmation', async () => {
        const response = await request(app)
            .post('/submit-form')
            .send({
                eventName: 'Integration Test Event',
                eventDescription: 'Testing frontend and backend connection.',
                eventLocation: 'Houston',
                skills: 'Testing',
                urgency: 'High',
                eventDate: '2024-10-15'
            });
        
        expect(response.status).toBe(200);
        expect(response.text).toBe('Form submitted successfully!');
    });
});

// Test for the GET / route to render the form
describe('GET /', () => {
    it('should return 200 and render the form', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toContain('<form'); // Ensure the form is present
    });
});

// Clean up after tests
afterAll((done) => {
    server.close(done); // Close the server after tests
});
