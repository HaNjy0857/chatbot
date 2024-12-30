const request = require("supertest");
const { expect } = require("chai");
const app = require("../../backend/server");
const User = require("../../backend/src/models/User");

describe("Auth API", () => {
  before(async () => {
    // Setup: Clear users table before tests
    await User.destroy({ where: {} });
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/auth/register").send({
        username: "testuser",
        password: "password123",
      });

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal("注册成功");

      const user = await User.findOne({ where: { username: "testuser" } });
      expect(user).to.not.be.null;
    });

    // Add more test cases (e.g., duplicate username, invalid input)
  });

  describe("POST /auth/login", () => {
    before(async () => {
      // Setup: Create a test user
      await authService.register("loginuser", "password123");
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app).post("/auth/login").send({
        username: "loginuser",
        password: "password123",
      });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("token");
      expect(res.body).to.have.property("role");
    });

    // Add more test cases (e.g., wrong password, non-existent user)
  });
});
