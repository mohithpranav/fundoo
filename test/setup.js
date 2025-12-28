import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Set test environment
process.env.NODE_ENV = "test";

// MongoDB connection for testing
const MONGODB_TEST_URI =
  process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/fundoo_test";

before(async function () {
  this.timeout(10000); // Increase timeout for DB connection

  try {
    await mongoose.connect(MONGODB_TEST_URI);
    console.log("Connected to test database");
  } catch (error) {
    console.error("Error connecting to test database:", error);
    throw error;
  }
});

after(async function () {
  this.timeout(10000);

  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log("Closed test database connection");
  } catch (error) {
    console.error("Error closing test database:", error);
  }
});
