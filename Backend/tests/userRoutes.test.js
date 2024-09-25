import mongoose from "mongoose";
import request from "supertest";
import app from "../index.js"; // Import your app instance

// Use the same MongoDB URI as your application
const mongoURI = process.env.MONGO_URI;

let token; // To store the authentication token
let testUserId; // To store the test user's ID

// Connect to the database before running tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  // Sign up a user and log in to get the token
  const signupRes = await request(app).post("/api/user/signup").send({
    name: "Test Hadi",
    email: "Had1@gmail.com",
    password: "123",
    phoneNumber: "81631084",
  });

  // Log in to get the token
  const loginRes = await request(app).post("/api/user/login").send({
    email: "Had1@gmail.com",
    password: "123",
  });
  token = loginRes.body.token;

  // Get the test user's ID from the login response
  const userRes = await request(app)
    .get("/api/user/self")
    .set("Authorization", `Bearer ${token}`);
  testUserId = userRes.body._id;
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Routes", () => {
  it("should login the user", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "Had1@gmail.com",
      password: "123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should get all users", async () => {
    const res = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // Expect the response to be an array
    expect(res.body.length).toBeGreaterThan(0); // Expect at least one user in the response
  });

  it("should get the current user", async () => {
    const res = await request(app)
      .get("/api/user/self")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("email", "Had1@gmail.com");
  });

  it("should get a specific user by ID", async () => {
    const res = await request(app)
      .get(`/api/user/${testUserId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", testUserId);
  });

  it("should delete the test user", async () => {
    const res = await request(app)
      .delete(`/api/user/${testUserId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User deleted successfully");
  });
});
