const app = require('./index');
const request = require('supertest')(app);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addHabit, updateHabit, deleteHabit } = require('./controller/habitController');


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
  it('should delete the test user', async () => {
    const testUsers = await prisma.user.findMany({ where: { email: testUser.email } });

    for (const user of testUsers) {
      // Delete the associated user trophies first
      await prisma.userTrophy.deleteMany({ where: { userId: user.id } });
      await prisma.habit.deleteMany({ where: { userId: user.id } });
      // Delete the user
      await prisma.user.delete({ where: { id: user.id } });
    }

    const deletedUsers = await prisma.user.findMany({ where: { email: testUser.email } });
    expect(deletedUsers.length).toBe(0);
  });
});

describe('Habit Management', () => {
  afterAll(async () => {
    // Delete the test user and associated habits
    await prisma.habit.deleteMany({ where: { userId: 'c0ce1733-bdee-42a2-9670-7f61327e4aa1' } });
    await prisma.$disconnect();
  });

  it('should add a habit to an existing user', async () => {
    // Prepare the habit data
    const habitData = {
      title: 'Test Habit',
      description: 'Test habit description',
      logDays: ['Monday', 'Wednesday', 'Friday'],
      duration: 30,
      isPublic: "on",
    };

    // Create mock request and response objects
    const mockRequest = {
      user: { id: 'c0ce1733-bdee-42a2-9670-7f61327e4aa1' },
      body: habitData,
    };
    const mockResponse = {
      redirect: jest.fn(),
    };

    // Add the habit to the user
    await addHabit(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/');

    // Check if the habit is added to the user in the database
    const habit = await prisma.habit.findFirst({
      where: { name: habitData.title, userId: 'c0ce1733-bdee-42a2-9670-7f61327e4aa1' },
    });

    expect(habit).toBeTruthy();
    expect(habit.name).toBe(habitData.title);
    expect(habit.description).toBe(habitData.description);
    expect(habit.logDays).toEqual(habitData.logDays.join(','));
    expect(habit.duration).toBe(habitData.duration);
    expect(habit.isPublic).toBe(true);
    expect(habit.userId).toBe('c0ce1733-bdee-42a2-9670-7f61327e4aa1');
  });

  it('should update an existing habit', async () => {
    // Prepare the updated habit data
    const updatedHabitData = {
      title: 'Updated Habit',
      description: 'Updated habit description',
      logDays: ['Tuesday', 'Thursday'],
      duration: 60,
      isPublic: "off",
    };
  
    // Get the test user's habit
    const habit = await prisma.habit.findFirst({
      where: { userId: 'c0ce1733-bdee-42a2-9670-7f61327e4aa1' },
    });
  
    // Create mock request and response objects
    const mockRequest = {
      user: { id: 'c0ce1733-bdee-42a2-9670-7f61327e4aa1' },
      params: { habitId: habit.id },
      body: updatedHabitData,
    };
    const mockResponse = {
      redirect: jest.fn(),
    };
  
    // Update the habit
    await updateHabit(mockRequest, mockResponse);
  
    expect(mockResponse.redirect).toHaveBeenCalledWith('/');
  
    // Check if the habit is updated in the database
    const updatedHabit = await prisma.habit.findFirst({
      where: { id: habit.id },
    });
  
    expect(updatedHabit).toBeTruthy();
    expect(updatedHabit.name).toBe(updatedHabitData.title);
    expect(updatedHabit.description).toBe(updatedHabitData.description);
    expect(updatedHabit.logDays).toEqual(updatedHabitData.logDays.join(','));
    expect(updatedHabit.duration).toBe(updatedHabitData.duration);
    expect(updatedHabit.isPublic).toBe(false);
    expect(updatedHabit.userId).toBe('c0ce1733-bdee-42a2-9670-7f61327e4aa1');
  });

  it('should delete an existing habit', async () => {
    // Get the test user's habit
    const habit = await prisma.habit.findFirst({
      where: { userId: 'c0ce1733-bdee-42a2-9670-7f61327e4aa1' },
    });
  
    // Create mock request and response objects
    const mockRequest = {
      user: { id: 'c0ce1733-bdee-42a2-9670-7f61327e4aa1' },
      params: { habitId: habit.id },
    };
    const mockResponse = {
      redirect: jest.fn(),
    };
  
    // Delete the habit
    await deleteHabit(mockRequest, mockResponse);
  
    expect(mockResponse.redirect).toHaveBeenCalledWith('/');
  
    // Check if the habit is deleted from the database
    const deletedHabit = await prisma.habit.findUnique({
      where: { id: habit.id },
    });
  
    expect(deletedHabit).toBeNull();
  });
  
});