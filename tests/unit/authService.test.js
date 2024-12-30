const { expect } = require("chai");
const sinon = require("sinon");
const authService = require("../../backend/src/services/authService");
const User = require("../../backend/src/models/User");
const { hashPassword } = require("../../backend/src/utils/hashPassword");

describe("Auth Service", () => {
  describe("register", () => {
    it("should create a new user with hashed password", async () => {
      const createStub = sinon.stub(User, "create");
      const hashStub = sinon.stub().resolves("hashedPassword");
      sinon.replace(
        require("../../backend/src/utils/hashPassword"),
        "hashPassword",
        hashStub
      );

      await authService.register("testuser", "password123");

      expect(hashStub.calledWith("password123")).to.be.true;
      expect(
        createStub.calledWith({
          username: "testuser",
          password: "hashedPassword",
          role: "user",
        })
      ).to.be.true;

      createStub.restore();
      sinon.restore();
    });
  });

  // Add more tests for login and other functions
});
