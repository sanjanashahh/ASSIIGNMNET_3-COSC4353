const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { app, volunteerProfiles } = require('./backend');

// Ensure the uploads directory exists before tests
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

let server;

describe('Volunteer Profile API', () => {
    beforeAll((done) => {
        const testPort = Math.floor(Math.random() * 50000) + 10000; // Dynamic port
        server = app.listen(testPort, () => {
            console.log(`Test server running on port ${testPort}`);
            done();
        });
    });
    
    afterAll(() => {
        server.close(); // Close the server after all tests
        if (fs.existsSync(uploadDir)) {
            fs.rmSync(uploadDir, { recursive: true }); // Use fs.rmSync for compatibility with Node.js
        }
    });

    describe('GET /volunteer', () => {
        it('should return the volunteer profile', async () => {
            const res = await request(app).get('/volunteer');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('fullName', 'John Doe');
        });
    });

    describe('POST /volunteer', () => {
        afterEach(() => {
            const filePath = path.join(uploadDir, 'uploads/default.png');
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Clean up uploaded files
            }
        });

        it('should successfully update the volunteer profile', async () => {
            const filePath = path.join(__dirname, 'test-image.png');
            fs.writeFileSync(filePath, 'fake image data'); // Create a temporary test image

            const res = await request(app)
                .post('/volunteer')
                .field('fullName', 'Jane Doe')
                .field('address1', '456 Elm St')
                .field('city', 'Dallas')
                .field('state', 'TX')
                .field('zipcode', '75001')
                .field('summary', 'A passionate volunteer')
                .field('availability', JSON.stringify(['2024-09-24', '2024-09-25']))
                .attach('image-file', filePath);

            fs.unlinkSync(filePath); // Cleanup temporary test file
        });

        it('should return validation errors for missing fields', async () => {
            const res = await request(app)
                .post('/volunteer')
                .field('address1', '456 Elm St'); // Missing required fields

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toContainEqual('Full name is required');
        });

        it('should return an error if zipcode is invalid', async () => {
            const res = await request(app)
                .post('/volunteer')
                .field('fullName', 'John Doe')
                .field('address1', '123 Main St')
                .field('city', 'Houston')
                .field('state', 'TX')
                .field('zipcode', '123') // Invalid zipcode
                .field('summary', 'A passionate volunteer')
                .field('availability', JSON.stringify(['2024-09-24', '2024-09-25']));

            expect(res.statusCode).toEqual(400);
            expect(res.body.errors).toContainEqual('Zipcode should be a valid format');
        });
    });

    it('should return 400 for invalid state', async () => {
        const res = await request(app)
            .post('/volunteer')
            .field('fullName', 'Jane Doe')
            .field('address1', '123 Main St')
            .field('city', 'Houston')
            .field('state', 'Texas') // Invalid state
            .field('zipcode', '77001')
            .field('availability', JSON.stringify(['2024-09-24', '2024-09-25']))
            .attach('image-file', Buffer.from('test image'), 'test.png');

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain('State should be a 2-character abbreviation');
    });

    it('should return 400 for availability not being an array', async () => {
        const res = await request(app)
            .post('/volunteer')
            .field('fullName', 'Jane Doe')
            .field('address1', '123 Main St')
            .field('city', 'Houston')
            .field('state', 'TX')
            .field('zipcode', '77001')
            .field('availability', '2024-09-24') // Invalid
            .attach('image-file', Buffer.from('test image'), 'test.png');

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain('At least one availability date should be selected');
    });

    it('should upload a file and update the profile', async () => {
        const filePath = path.join(__dirname, 'test-image.png');
        fs.writeFileSync(filePath, 'fake image data'); // Create a temporary test image

        const response = await request(app)
            .post('/volunteer')
            .field('fullName', 'Jane Doe')
            .field('address1', '456 Elm St')
            .field('city', 'Dallas')
            .field('state', 'TX')
            .field('zipcode', '75001')
            .field('availability[]', '2024-09-24')
            .attach('image-file', filePath);
    
        expect(response.status).toBe(200);
        expect(response.body.profile).toHaveProperty('fullName', 'Jane Doe');

        fs.unlinkSync(filePath); // Cleanup temporary test file
    });
});
