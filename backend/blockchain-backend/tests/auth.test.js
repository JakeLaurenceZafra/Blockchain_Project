import request from 'supertest';
import app from '../src/app'; // Adjust the path as necessary

describe('Authentication Routes', () => {
  let user = {
    name: 'Test User',
    username: 'testuser',
    password: 'password123',
    cardanoAddress: 'addr_test1...'
  };

  beforeAll(async () => {
    // Optionally, you can create a user in the database before tests
    await request(app).post('/api/auth/register').send(user);
  });

  afterAll(async () => {
    // Optionally, clean up the database after tests
    await request(app).delete(`/api/auth/delete/${user.username}`);
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'New User',
        username: 'newuser',
        password: 'newpassword',
        cardanoAddress: 'addr_test1...'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: user.username,
        password: user.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: user.username,
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid username or password');
  });
});