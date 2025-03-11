const mongoose = require("mongoose");

async function connectDB() {
  const dbURI = "mongodb://localhost:27017/starter_project"; // Replace with your connection string
  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB connected");
    seed(); // Call the seed function after successful connection
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}

function seed() {
  // Accessing the database
  const db = mongoose.connection;

  // Create collections and insert data (Mongoose will create them for you automatically)
  const apiKeySchema = new mongoose.Schema({
    metadata: String,
    key: String,
    version: Number,
    status: Boolean,
    createdAt: Date,
    updatedAt: Date,
  });

  const roleSchema = new mongoose.Schema({
    code: String,
    status: Boolean,
    createdAt: Date,
    updatedAt: Date,
  });

  const ApiKey = mongoose.model("ApiKey", apiKeySchema, "api_keys");
  const Role = mongoose.model("Role", roleSchema, "roles");

  // Insert data into api_keys and roles collections
  ApiKey.create({
    metadata: "To be used by the vendor: developer",
    key: "GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj",
    version: 1,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  Role.create([
    { code: "USER", status: true, createdAt: new Date(), updatedAt: new Date() },
    { code: "ADMIN", status: true, createdAt: new Date(), updatedAt: new Date() },
  ]);

  console.log("Data seeded successfully!");

  return true
}

connectDB().catch(console.error);
