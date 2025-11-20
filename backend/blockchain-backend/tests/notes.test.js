const request = require('supertest');
const app = require('../src/app'); // Adjust the path as necessary
const Note = require('../src/models/note'); // Adjust the path as necessary

describe('Notes API', () => {
  let noteId;

  beforeAll(async () => {
    await Note.deleteMany(); // Clear the notes collection before tests
  });

  afterAll(async () => {
    await Note.deleteMany(); // Clean up after tests
  });

  it('should create a new note', async () => {
    const response = await request(app)
      .post('/api/notes') // Adjust the route as necessary
      .send({
        title: 'Test Note',
        content: 'This is a test note.',
        tag: 'To-Do'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    noteId = response.body._id; // Store the note ID for later tests
  });

  it('should retrieve all notes', async () => {
    const response = await request(app).get('/api/notes'); // Adjust the route as necessary

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should retrieve a note by ID', async () => {
    const response = await request(app).get(`/api/notes/${noteId}`); // Adjust the route as necessary

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id', noteId);
  });

  it('should update a note', async () => {
    const response = await request(app)
      .put(`/api/notes/${noteId}`) // Adjust the route as necessary
      .send({
        title: 'Updated Test Note',
        content: 'This is an updated test note.',
        tag: 'Reminder'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('title', 'Updated Test Note');
  });

  it('should delete a note', async () => {
    const response = await request(app).delete(`/api/notes/${noteId}`); // Adjust the route as necessary

    expect(response.status).toBe(204);
  });
});