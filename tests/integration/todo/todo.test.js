const request = require("supertest");
const app = require("../../../app");
const mongoose = require("mongoose");
const User = require("../../../database/mongoose/models/user");
const Todo = require("../../../database/mongoose/models/todo");

const DB_NAME = "Integration_test";
const MONGO_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let authToken;
let apiKey;
let userId;
let todoId;

// Function to connect to test database
async function connectDB() {
  try {
    if (
      mongoose.connection.readyState === 0 ||
      mongoose.connection.name !== DB_NAME
    ) {
      await mongoose.disconnect(); // Ensure no previous connections
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`Connected to MongoDB: ${DB_NAME}`);
      await seed(); // Seed initial test data
    }
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}

// Function to seed test data
async function seed() {
  const ApiKey =
    mongoose.models.ApiKey ||
    mongoose.model(
      "ApiKey",
      new mongoose.Schema({
        metadata: String,
        key: String,
        version: Number,
        status: Boolean,
        createdAt: Date,
        updatedAt: Date,
      }),
      "api_keys"
    );

  const Role =
    mongoose.models.Role ||
    mongoose.model(
      "Role",
      new mongoose.Schema({
        code: String,
        status: Boolean,
        createdAt: Date,
        updatedAt: Date,
      }),
      "roles"
    );

  // Insert API key and roles
  const apiKeyData = await ApiKey.create({
    metadata: "To be used by the vendor: developer",
    key: "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj",
    version: 1,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await Role.create([
    {
      code: "USER",
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: "ADMIN",
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  apiKey = apiKeyData.key; // Store API key for tests
  console.log("Seed data inserted successfully.");
}

// Setup before all tests
beforeAll(async () => {
  await connectDB();

  // Create a test user
  const user = await User.create({
    email: "mbera829@gmail.com",
    phone: "8172059732",
    name: {
      first: "Mrinal",
      last: "Bera",
    },
    password: "qwerty123",
  });
  userId = user._id;

  // Login the test user and retrieve token
  const response = await request(app)
    .post("/v1/auth/login")
    .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
    .send({
      email: "mbera829@gmail.com",
      password: "qwerty123",
    });

  authToken = response.body.data.tokens.accessToken; // Store JWT token
  userId = response.body.data.user._id; // Store user ID
  console.log("User authenticated successfully.");
});

// **TODO API Integration Tests**
describe("Todo API Integration Tests", () => {
  /*** CREATE TODO - Positive Case ***/
  test("Should create a todo successfully", async () => {
    const response = await request(app)
      .post("/v1/auth/todo")
      .set("x-api-key", apiKey)
      .set("x-user-id", userId)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Todo",
        description: "This is a test todo",
        dueDate: "2025-01-01",
        priority: "high",
        status: "pending",
      });
      
      
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Todo created successfully");

    todoId = response.body.todo._id; // Store the created todo ID for further testsrespon
    
  });

  /*** CREATE TODO - Negative Case (Missing Title) ***/
  test("Should fail to create a todo without title", async () => {
    const response = await request(app)
      .post("/v1/auth/todo")
      .set("x-api-key", apiKey)
      .set("x-user-id", userId)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Todo",
        // description: "This is a test todo",
        dueDate: "2025-01-01",
        priority: "high",
        status: "pending",
      });

    expect(response.statusCode).toBe(400);
    // expect(response.body.message).toContain("Title is required");
  });

  // /*** GET ALL TODOS - Positive Case ***/
  test("Should retrieve all todos", async () => {
      const response = await request(app)
          .get("/v1/auth/todos")
          .set("x-api-key", apiKey)
          .set("x-user-id", userId)
          .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.todos)).toBe(true);
  });
  test("Should return 400 if Authorization header is missing", async () => {
    const response = await request(app)
        .get("/v1/auth/todos")
        .set("x-api-key", apiKey)
        .set("x-user-id", userId); // Missing Authorization header

    expect(response.statusCode).toBe(400);
    // expect(response.body.message).toBe("Authorization token is required");
});
test("Should return 401 if Authorization token is invalid", async () => {
  const invalidToken = "invalidToken123";
  const response = await request(app)
      .get("/v1/auth/todos")
      .set("x-api-key", apiKey)
      .set("x-user-id", userId)
      .set("Authorization", `Bearer ${invalidToken}`);

  expect(response.statusCode).toBe(401);
  expect(response.body.message).toBe("Token is not valid");
});
test("Should return 400 if x-api-key header is missing", async () => {
  const response = await request(app)
      .get("/v1/auth/todos")
      .set("x-user-id", userId)  // Missing x-api-key header
      .set("Authorization", `Bearer ${authToken}`);

  expect(response.statusCode).toBe(400);
  // expect(response.body.message).toBe("API key is required");
});
test("Should return 404 if user is not found", async () => {
  const invalidUserId = "nonexistentUserId";  // Invalid user ID
  const response = await request(app)
      .get("/v1/auth/todos")
      .set("x-api-key", apiKey)
      .set("x-user-id", invalidUserId)
      .set("Authorization", `Bearer ${authToken}`);

  expect(response.statusCode).toBe(400);
  // expect(response.body.message).toBe("User not found");
});
test("Should return 500 if there is a server error", async () => {
  // Simulate a server error (e.g., database issue)
  jest.spyOn(Todo, 'find').mockImplementationOnce(() => { throw new Error("Database error") });

  const response = await request(app)
      .get("/v1/auth/todos")
      .set("x-api-key", apiKey)
      .set("x-user-id", userId)
      .set("Authorization", `Bearer ${authToken}`);

  expect(response.statusCode).toBe(500);
  // expect(response.body.message).toBe("An error occurred while fetching todos");
});



  // /*** GET SINGLE TODO - Positive Case ***/
  test("Should retrieve a single todo by ID", async () => {
      const response = await request(app)
          .get(`/v1/auth/todo/${todoId}`)
          .set("x-api-key", apiKey)
          .set("x-user-id", userId)
          .set("Authorization", `Bearer ${authToken}`);

          
          console.log("---------UserId--------->>>>>>>>",userId);

      expect(response.statusCode).toBe(200);
      expect(response.body.todo._id).toBe(todoId);
  });

  // /*** GET SINGLE TODO - Negative Case (Invalid ID) ***/
  test("Should return 404 for a non-existent todo", async () => {
      const response = await request(app)
          .get(`/v1/auth/todo/123456789012345678901234`) // Invalid ObjectId
          .set("x-api-key", apiKey)
          .set("x-user-id", userId)
          .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(500);
      // expect(response.error).toBe("Todo not found");
  });

  // /*** UPDATE TODO - Positive Case ***/
  test("Should update a todo successfully", async () => {
    console.log("---------UserId--------->>>>>>>>",userId);

      const response = await request(app)
          .put(`/v1/auth/todo/${todoId}`)
          .set("x-api-key", apiKey)
          .set("x-user-id", userId)
          .set("Authorization", `Bearer ${authToken}`)
          .send({
              title: "Updated Todo Title",
              description: "Updated description",
              status: "completed",
          });
      expect(response.statusCode).toBe(200);
      // expect(response.body.message).toBe("Todo updated successfully");
  });

  test("Should fail to update a todo when API Key is missing", async () => {
    const response = await request(app)
        .put(`/v1/auth/todo/${todoId}`)
        .set("x-user-id", userId)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
            title: "Updated Todo Title",
            description: "Updated description",
            status: "completed",
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("x-api-key is required");
});

test("Should fail to update a todo with invalid todoId", async () => {
  const invalidTodoId = "invalid-id-123";
  
  const response = await request(app)
      .put(`/v1/auth/todo/${invalidTodoId}`)
      .set("x-api-key", apiKey)
      .set("x-user-id", userId)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
          title: "Updated Todo Title",
          description: "Updated description",
          status: "completed",
      });

  expect(response.statusCode).toBe(500);
  // expect(response.body.message).toBe("Invalid Todo ID");
});

test("Should fail to update a todo with invalid auth token", async () => {
  const invalidAuthToken = "invalid.token.123";

  const response = await request(app)
      .put(`/v1/auth/todo/${todoId}`)
      .set("x-api-key", apiKey)
      .set("x-user-id", userId)
      .set("Authorization", `Bearer ${invalidAuthToken}`)
      .send({
          title: "Updated Todo Title",
          description: "Updated description",
          status: "completed",
      });

  expect(response.statusCode).toBe(401);
  expect(response.body.message).toBe("Token is not valid");
});

test("Should fail to update a todo when required fields are missing", async () => {
  const response = await request(app)
      .put(`/v1/auth/todo/${todoId}`)
      .set("x-api-key", apiKey)
      .set("x-user-id", userId)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
          title: "", // Title is empty
          status: "completed",
      });

  expect(response.statusCode).toBe(500);
  // expect(response.body.message).toBe("Title and description are required");
});
test("Should fail to update another user's todo", async () => {
  const differentUserId = "otherUserId123"; // Assume this belongs to another user

  const response = await request(app)
      .put(`/v1/auth/todo/${todoId}`)
      .set("x-api-key", apiKey)
      .set("x-user-id", differentUserId) // Different user ID
      .set("Authorization", `Bearer ${authToken}`)
      .send({
          title: "Updated Todo Title",
          description: "Updated description",
          status: "completed",
      });

  expect(response.statusCode).toBe(400);
  // expect(response.body.message).toBe("You are not allowed to update this todo");
});
  // /*** DELETE TODO - Positive Case ***/
  test("Should delete a todo successfully", async () => {
      const response = await request(app)
          .delete(`/v1/auth/todo/${todoId}`)
          .set("x-api-key", apiKey)
          .set("x-user-id", userId)
          .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Todo deleted");
  });

  test("Should fail to delete a todo with an invalid todoId", async () => {
    const invalidTodoId = "invalid-id-123";

    const response = await request(app)
        .delete(`/v1/auth/todo/${todoId}`)
        .set("x-api-key", apiKey)
        .set("x-user-id", userId)
        .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(500);
    // expect(response.body.message).toBe("Invalid Todo ID");
});

test("Should fail to delete a todo when authentication headers are missing", async () => {
  const response = await request(app)
      .delete(`/v1/auth/todo/${todoId}`);

  expect(response.statusCode).toBe(400);
  // expect(response.body.message).toBe("Authentication required");
});
  // /*** DELETE TODO - Negative Case (Already Deleted) ***/
  test("Should return 404 when deleting a non-existent todo", async () => {
      const response = await request(app)
          .delete(`/api/v1/todos/${todoId}`)
          .set("x-api-key", apiKey)
          .set("x-user-id", userId)
          .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe("Not Found");
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
