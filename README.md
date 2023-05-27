# Agile-Development-Project

## NOTES TO KNOW BEFORE CLONING:
When cloned, it will be in the structure: `Agile-Development-Project/HabitForge/`. Therefore, you can clone it straight to your desktop but if you clone it into a folder that you have created, keep in mind the structure will then be `<folder-you-created>/Agile-Development-Project/HabitForge/`. Just keep in mind that you must `cd` to the `/HabitForge/` directory to execute all commands as directed in the instructions below. 

## Basic Steps to Run the App:
1. Make sure you are in the right location.
   - Navigate to the `Agile-Development-Project/HabitForge/` directory. You can use the command `cd ./Agile-Development-Project/HabitForge/` in your code editor's terminal (modify the command if your current directory is different).

2. Make sure you have all dependencies installed.
   - Run the command `npm install` in the terminal. Make sure you execute this command in the `Agile-Development-Project/HabitForge/` directory.

3. Start the app:
   - Run the command `npm start`.

4. Open the app on a web browser:
   - Access the app by entering `localhost:3000/login` in the URL of your preferred web browser.

5. Close the server:
   - When you're finished, press `CTRL + C` in your terminal to stop the server.

Please follow these steps to set up and run the HabitForge app successfully.

## Explanation of the App's Directory Structure:
1. Controller:
The `controller` directory contains files responsible for handling the logic and operations of specific features or entities in the application. These files act as intermediaries between incoming requests and the underlying data or business logic. Each file within the `controller` directory focuses on a specific feature or entity and contains functions that handle various operations related to that feature.

2. Routes:
The `routes` directory defines the routes or URLs that users can access to interact with different features of the application. It maps incoming requests to the appropriate controller functions or handlers. By defining routes, we determine how the server should respond when a user visits a specific URL. The `routes` directory helps in organizing and managing the different routes and actions associated with the application's features.

3. Middleware:
The `middleware` directory contains files that provide middleware functions to handle common tasks in the application. Middleware functions sit between the server and the route handlers, allowing for additional processing of requests and responses. For example, the `passport.js` file sets up authentication strategies, the `authMiddleware.js` file provides functions for handling authentication checks, and the `setCurrentPageMiddleware.js` file sets the current page variable for dynamic view rendering.

4. Public:
The `public` directory is where we store static assets that are directly served to clients' browsers. This directory includes our CSS files, JavaScript files, and images. Placing these assets in the `public` directory ensures that they are easily accessible and can be referenced directly in the HTML or client-side code. This directory helps separate static assets from server-side logic and allows the browser to retrieve them efficiently.

5. Index.js:
The `index.js` file serves as the entry point of our application. It's where the server is initialized, and the main execution starts. In this file, we typically import necessary dependencies and modules, configure the server settings, establish connections to databases or external services, and define the routes for handling incoming requests. The `index.js` file brings together the various components of our application, such as controllers, middleware, and routes, to create a functioning server.

By organizing our codebase in this directory structure, we achieve a modular and maintainable architecture. It allows us to separate concerns, such as handling business logic (`controller`), defining routes (`routes`), implementing middleware, and managing static assets (`public`). The `index.js` file serves as the entry point, initializing the server and connecting all the components together to create a cohesive application.

## How to Run the Unit Tests:
Our unit tests are located in the `index.test.js` file. To run the unit tests, execute the command `npm test`. Make sure you execute this command in the `Agile-Development-Project/HabitForge/` directory.
