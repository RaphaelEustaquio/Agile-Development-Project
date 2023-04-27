const bcrypt = require('bcryptjs');
const fs = require('fs');

async function createDummyUser() {
  // Load the existing users from the users.json file
  const users = JSON.parse(fs.readFileSync('data/users.json'));

  // Generate a hashed password for the dummy user
  const password = 'password';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new dummy user object with the hashed password
  const newUser = {
    id: '2',
    name: 'Test User',
    email: 'test@example.com',
    password: hashedPassword,
    habits: ['quit smoking']
  };

  // Add the new user object to the array of existing users
  users.push(newUser);

  // Write the updated array of users back to the users.json file
  fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));

}

createDummyUser().catch(console.error);
