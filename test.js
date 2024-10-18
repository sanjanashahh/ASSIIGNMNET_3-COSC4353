const request = require('supertest'); // Supertest to test HTTP requests
const { app, startServer } = require('./server.cjs') // Your Express app
const express = require('express');


// Mock data
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  password: 'password123',
  phoneNumber: '1234567890',
  role: 'user',
};

// This will hold the server instance
let server;

beforeAll((done) => {
  server = app.listen(3000, () => {
    done();
  });
});

afterAll((done) => {
  server.close(done);  // Close the server after tests
});

describe('Authentication API', () => {
  // Register user only once if they do not already exist
  beforeAll(async () => {
    const existingUserResponse = await request(app).post('/login').send({
      username: mockUser.username,
      password: mockUser.password,
    });

    if (existingUserResponse.statusCode !== 200) {
      // Only register if the user does not exist
      const registerResponse = await request(app).post('/register').send(mockUser);
      console.log('Register Response:', registerResponse.body); // Log registration response
    }
  });

  // Test registration with missing required fields
  it('should fail to register user with missing required fields', async () => {
    const res = await request(app)
      .post('/register')
      .send({ username: '', password: '', role: '' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'First name is required' }),
        expect.objectContaining({ msg: 'Last name is required' }),
        expect.objectContaining({ msg: 'Username must be at least 5 characters long' }),
        expect.objectContaining({ msg: 'Role is required' })
      ])
    );
  });

  // Test registration with a short password
  it('should fail to register user with a short password', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        ...mockUser,
        password: 'short', // Simulate a short password
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Password must be at least 8 characters long' })
      ])
    );
  });

  // Test login with incorrect credentials
  // Test login with incorrect credentials
it('should fail login with incorrect credentials', async () => {
  const res = await request(app)
    .post('/login')
    .send({
        username: mockUser.username, 
        password: 'wrongpassword', // Simulated wrong password
        role: mockUser.role // Include the role in the login request
    });

  // Expect the status code to be 401 for invalid credentials
  expect(res.statusCode).toEqual(401);  
  expect(res.body).toHaveProperty('message', 'Invalid credentials');
});

  // Test login with correct credentials
  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: mockUser.username,
        password: mockUser.password,
        role: mockUser.role,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
  });

  // Test protected route access with valid token
  it('should access the protected dashboard route with valid token', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: mockUser.username,
        password: mockUser.password,
        role: mockUser.role,
      });

    const token = loginRes.body.token;

    // Test the protected route
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain(mockUser.username);
  });

  // Test access to the dashboard without a token
  it('should deny access to the dashboard without a token', async () => {
    const res = await request(app)
      .get('/dashboard');

    expect(res.statusCode).toEqual(401);
  });

  // Test access to the dashboard with an invalid token
  it('should deny access to the dashboard with an invalid token', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toEqual(401);  // Adjusted status code
    expect(res.body).toHaveProperty('message', 'Invalid or expired token');
  });

  // Integration Test: Simulate frontend registration and login
  it('should integrate frontend and backend for user registration and login', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post('/register')
      .send(mockUser);

    console.log('Register Response:', registerResponse.body); // Log response for registration

    // Check if registration was successful
    if (registerResponse.statusCode === 200) {
      expect(registerResponse.body).toHaveProperty('message', 'User registered successfully');
    } else {
      expect(registerResponse.statusCode).toEqual(400);
      expect(registerResponse.body).toHaveProperty('message', 'User already exists');
    }

    // Step 2: Log in with the same user credentials
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: mockUser.username,
        password: mockUser.password,
        role: mockUser.role,
      });

    expect(loginResponse.statusCode).toEqual(200);
    expect(loginResponse.body).toHaveProperty('message', 'Login successful');
    expect(loginResponse.body).toHaveProperty('token'); // Ensure we get a token back

    // Step 3: Access the protected dashboard route with the token
    const token = loginResponse.body.token;
    const protectedResponse = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedResponse.statusCode).toEqual(200);
    expect(protectedResponse.body).toHaveProperty('message');
    expect(protectedResponse.body.message).toContain(mockUser.username); // Ensure it contains the username
  });
});
