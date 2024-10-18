const request = require('supertest'); // To simulate HTTP requests
const express = require('express');
const app = require('../volunteer_history_backend.js'); // Adjust path as needed

describe('Volunteer History API', () => {
  
  // Test for GET /api/volunteer-history
  it('should return the volunteer history', async () => {
    const response = await request(app).get('/api/volunteer-history');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test for POST /api/triggerVolunteerHistory
  it('should add new volunteer history on POST', async () => {
    const response = await request(app).post('/api/triggerVolunteerHistory');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('eventName', 'Blood Donation');
    expect(response.body).toHaveProperty('status', 'Pending');
  });
});