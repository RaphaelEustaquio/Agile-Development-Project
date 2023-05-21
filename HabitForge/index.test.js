const app = require('./index');
const request = require('supertest')(app);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password',
};

describe('Authentication', () => {
  // Login test
  it('should log in a user and return 200 status', async () => {
    const response = await request
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
  });

  // Register test
  it('should register a user and return 302 status', async () => {
    const response = await request
      .post('/register')
      .send(testUser);
  
    expect(response.status).toBe(302);
  
    const testUsers = await prisma.user.findUnique({ where: { email: testUser.email } });
    expect(testUsers).toBeTruthy();
  
    console.log('Test user registered successfully:', testUser.email);
  });
  

  // User deletion test
  it('should delete the test users', async () => {
    // Find the test users in the database using Prisma
    const testUsers = await prisma.user.findMany({ where: { email: testUser.email } });

    // Delete the test users
    for (const user of testUsers) {
      await prisma.user.delete({ where: { id: user.id } });
    }

    // Make assertions to check if the users were successfully deleted
    const deletedUsers = await prisma.user.findMany({ where: { email: testUser.email } });
    expect(deletedUsers.length).toBe(0);
  });
});

// describe('Habit Management', () => {
//   let user;
//     // Login the test user first
//     beforeAll(async () => {
//       await request.post('/register').send(testUser);
//       await request.post('/login').send({ email: testUser.email, password: testUser.password });
//       user = await prisma.user.findUnique({ where: { email: testUser.email }, include: { habits: true} });
//     });
//   // Add habit test
//   it('should add a habit for the test user', async () => {
//     console.log(user)
//     const habitData = {
//       name: 'Test Habit',
//       description: 'This is a test habit',
//       logDays: 'Monday,Wednesday,Friday',
//       duration: 30,
//       isPublic: true,
//       userId: user.id,
//     };
//     // Send a request to add a habit
//     const response = await request
//       .post('/add-habit')
//       .send(habitData)
//       .set('Cookie', 'connect.sid=' + user.sessionCookie); // Pass the session cookie to authenticate the request


//     expect(response.status).toBe(302); // Assuming the redirect status is 302
//     console.log(habitData.name)

//     // Assert that the habit was added successfully in the database
//     const addedHabit = await prisma.habit.findFirst({
//       where: { name: 'Test Habit' },
//     });
//     expect(addedHabit).toBeTruthy();
//   });
//   afterAll(async () => {
//     await prisma.user.deleteMany({ where: { email: testUser.email } });
//   });
// });