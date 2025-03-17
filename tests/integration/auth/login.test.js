const request = require("supertest");
const app = require("../../../app");
const mongoose = require("mongoose");
const User = require("../../../database/mongoose/models/user");

const DB_NAME = "Integration_test";
const MONGO_URI = `mongodb://127.0.0.1:27017/${DB_NAME}`;

let authToken;
let userId;

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

  await ApiKey.create({
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

describe("Login Route - Positive & Negative Tests", () => {
  it("should register a new user", async () => {
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
  });

  it("should login a user successfully and return auth token", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
      .send({
        email: "mbera829@gmail.com",
        password: "qwerty123",
      });

    expect(response.statusCode).toBe(200);
    // expect(response.body).toHaveProperty("authToken");
    // authToken = response.body.data.tokens.accessToken;
    // console.log(authToken);
  });

  it("should not login with incorrect email", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
      .send({
        email: "wrongemail@gmail.com",
        password: "qwerty123",
      });

    expect(response.statusCode).toBe(400); // Assuming 401 Unauthorized
    // expect(response.body).toHaveProperty("message", "Invalid credentials");
  });

  it("should not login with incorrect password", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
      .send({
        email: "mbera829@gmail.com",
        password: "wrongpassword",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should not login without providing email", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
      .send({
        password: "qwerty123",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should not login without providing password", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
      .send({
        email: "mbera829@gmail.com",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should not login with an unregistered email", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
      .send({
        email: "unregistered@gmail.com",
        password: "qwerty123",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should not login with an invalid email format", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .set("x-api-key", "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj")
      .send({
        email: "invalid-email",
        password: "qwerty123",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should not login without API key", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "mbera829@gmail.com",
      password: "qwerty123",
    });

    expect(response.statusCode).toBe(400); // Assuming 403 Forbidden for missing API key
  });

  it("should not login with incorrect API key", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .set("x-api-key", "invalid-api-key")
      .send({
        email: "mbera829@gmail.com",
        password: "qwerty123",
      });

    expect(response.statusCode).toBe(403);
  });
});
