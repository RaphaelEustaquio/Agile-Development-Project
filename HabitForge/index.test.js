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

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'testpassword',
};

// Test login
const agent = request.agent(app);

beforeAll(async () => {
  await agent
    .post('/register')
    .send(testUser);
});

afterAll(async () => {
  // Cleanup
  const users = JSON.parse(fs.readFileSync(usersPath));
  const usersWithoutTestUser = users.filter(user => user.email !== testUser.email);
  fs.writeFileSync(usersPath, JSON.stringify(usersWithoutTestUser, null, 2));
});

describe('Test user login', () => {
  test('It should log in the user', async () => {
    const response = await agent
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.statusCode).toBe(302);
  });
});

describe('Test habit creation', () => {
  test('It should add a new habit', async () => {
    const newHabit = {
      title: 'Test Habit',
      description: 'This is a test habit',
      logDays: ['Monday', 'Wednesday', 'Friday'],
      duration: 10,
      isPublic: 'on'
    };

    const response = await agent
      .post('/add-habit')
      .send(newHabit);

    expect(response.statusCode).toBe(302);

    const users = JSON.parse(fs.readFileSync(usersPath));
    const user = users.find(user => user.email === testUser.email);
    expect(user).toBeTruthy();
    const habit = user.habits.find(habit => habit.name === newHabit.title);
    expect(habit).toBeTruthy();

    // Cleanup: delete the test habit
    const habitIndex = user.habits.findIndex(habit => habit.name === newHabit.title);
    user.habits.splice(habitIndex, 1);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  });
});
