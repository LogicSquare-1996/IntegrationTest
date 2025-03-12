const request = require("supertest");   
const app = require("../../../app");
const mongoose = require("mongoose");
const User = require("../../../database/mongoose/models/user");
const Todo = require("../../../database/mongoose/models/todo");

const DB_NAME = "Integration_test";
const MONGO_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let authToken;
let userId;

// Function to connect to test database
async function connectDB() {
    try {
        if (mongoose.connection.readyState === 0 || mongoose.connection.name !== DB_NAME) {
            await mongoose.disconnect(); // Ensure no previous connections
            await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log(`Connected to MongoDB: ${DB_NAME}`);
            await seed(); // Seed initial test data
        }
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
    }
}

// Function to seed test data
async function seed() {
    const ApiKey = mongoose.models.ApiKey || mongoose.model("ApiKey", new mongoose.Schema({
        metadata: String,
        key: String,
        version: Number,
        status: Boolean,
        createdAt: Date,
        updatedAt: Date,
    }), "api_keys");

    const Role = mongoose.models.Role || mongoose.model("Role", new mongoose.Schema({
        code: String,
        status: Boolean,
        createdAt: Date,
        updatedAt: Date,
    }), "roles");

    await ApiKey.create({
        metadata: "To be used by the vendor: developer",
        key: "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj",
        version: 1,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await Role.create([
        { code: "USER", status: true, createdAt: new Date(), updatedAt: new Date() },
        { code: "ADMIN", status: true, createdAt: new Date(), updatedAt: new Date() },
    ]);

    console.log("Seed data inserted successfully.");
}

// Setup before all tests
beforeAll(async () => {
    await connectDB();
});

// afterEach(async () => {
//     await User.deleteMany({}); // Clear user collection after each test
// });

// // ✅ Drop the test database after all tests
afterAll(async () => {
    console.log("Dropping test database...");
    await mongoose.connection.db.dropDatabase(); // Drop the test database
    await mongoose.connection.close(); // Close DB connection
    console.log("Test database deleted successfully.");
});


beforeAll(async () => {
    // Mock user authentication and get token (adjust based on your auth system)
    const userResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "testuser@example.com", password: "password" });
  
    token = userResponse.body.token; // Assuming JWT token is returned
    userId = userResponse.body.data.user._id
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
  
  describe("Todo API Integration Tests", () => {
    /*** CREATE TODO TEST CASES ***/
    test("Should create a todo successfully", async () => {
      const response = await request(app)
        .post("/api/v1/todos")
        .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
        .set("x-use-id",`${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Todo",
          description: "This is a test todo",
          dueDate: "2025-01-01",
          priority: "High",
          status: "Pending",
        });
  
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe("Todo created successfully");
      todoId = response.body.data._id;
    });
  
    test("Should return 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/v1/todos")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "",
          description: "",
        });
  
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Missing required fields");
    });
  
    test("Should return 401 when user is unauthorized", async () => {
      const response = await request(app)
        .post("/api/v1/todos")
        .send({
          title: "Unauthorized Todo",
          description: "Should not be created",
        });
  
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("Unauthorized: User ID is required");
    });
  
    /*** GET TODOS TEST CASES ***/
    test("Should fetch all todos for a user", async () => {
      const response = await request(app)
        .get("/api/v1/todos")
        .set("Authorization", `Bearer ${token}`);
  
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  
    /*** GET SINGLE TODO TEST CASES ***/
    test("Should fetch a single todo by ID", async () => {
      const response = await request(app)
        .get(`/api/v1/todos/${todoId}`)
        .set("Authorization", `Bearer ${token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body.data._id).toBe(todoId);
    });
  
    test("Should return 404 for a non-existent todo", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/todos/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);
  
      expect(response.statusCode).toBe(404);
    });
  
    /*** UPDATE TODO TEST CASES ***/
    test("Should update a todo successfully", async () => {
      const response = await request(app)
        .put(`/api/v1/todos/${todoId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Todo",
          description: "Updated description",
          priority: "Low",
          status: "Completed",
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Todo updated successfully");
    });
  
    test("Should return 400 when updating with invalid data", async () => {
      const response = await request(app)
        .put(`/api/v1/todos/${todoId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "",
          description: "",
        });
  
      expect(response.statusCode).toBe(400);
    });
  
    /*** UPDATE TODO STATUS TEST CASES ***/
    test("Should update the status of a todo", async () => {
      const response = await request(app)
        .patch(`/api/v1/todos/${todoId}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "Completed" });
  
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Todo status updated successfully");
    });
  
    /*** DELETE TODO TEST CASES ***/
    test("Should delete a todo successfully", async () => {
      const response = await request(app)
        .delete(`/api/v1/todos/${todoId}`)
        .set("Authorization", `Bearer ${token}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Todo deleted successfully");
    });
  
    test("Should return 404 when deleting a non-existent todo", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/todos/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);
  
      expect(response.statusCode).toBe(404);
    });
  });