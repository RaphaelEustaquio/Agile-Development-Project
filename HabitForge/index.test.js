const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('./index');
const usersPath = path.join(__dirname, 'data', 'users.json');

describe('Test user registration', () => {
  test('It should create a new user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword',
    };

    const response = await request(app)
      .post('/register')
      .send(newUser);


    expect(response.statusCode).toBe(302);
    const users = JSON.parse(fs.readFileSync(usersPath));
    const user = users.find(user => user.email === newUser.email);
    expect(user).toBeTruthy();

    // Clean up: delete the test user
    const usersWithoutTestUser = users.filter(user => user.email !== newUser.email);
    fs.writeFileSync(usersPath, JSON.stringify(usersWithoutTestUser, null, 2));
  });
});
