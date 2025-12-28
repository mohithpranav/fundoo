import { expect } from "chai";
import chai from "chai";
import chaiHttp from "chai-http";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import mongoose from "mongoose";

chai.use(chaiHttp);

describe("Authentication API Tests", () => {
  // Clear users before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe("POST /signup", () => {
    it("should register a new user successfully", (done) => {
      const newUser = {
        username: "testuser",
        email: "test@example.com",
        password: "Test@123",
      };

      chai
        .request(app)
        .post("/signup")
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("User registered successfully");
          expect(res.body).to.have.property("newUser");
          expect(res.body.newUser).to.have.property("email", newUser.email);
          expect(res.body.newUser).to.have.property(
            "username",
            newUser.username
          );
          done();
        });
    });

    it("should not register a user with existing email", (done) => {
      const user = {
        username: "testuser",
        email: "test@example.com",
        password: "Test@123",
      };

      // Create first user
      chai
        .request(app)
        .post("/signup")
        .send(user)
        .end(() => {
          // Try to create duplicate
          chai
            .request(app)
            .post("/signup")
            .send(user)
            .end((err, res) => {
              expect(res).to.have.status(400);
              expect(res.body).to.have.property("message");
              expect(res.body.message).to.equal("User already exists");
              done();
            });
        });
    });

    it("should not register a user with missing fields", (done) => {
      const invalidUser = {
        email: "test@example.com",
        // missing username and password
      };

      chai
        .request(app)
        .post("/signup")
        .send(invalidUser)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe("POST /signin", () => {
    beforeEach(async () => {
      // Create a test user before each signin test
      const user = {
        username: "testuser",
        email: "test@example.com",
        password: "Test@123",
      };
      await chai.request(app).post("/signup").send(user);
    });

    it("should sign in with valid credentials", (done) => {
      const credentials = {
        email: "test@example.com",
        password: "Test@123",
      };

      chai
        .request(app)
        .post("/signin")
        .send(credentials)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("token");
          expect(res.body.token).to.be.a("string");
          done();
        });
    });

    it("should not sign in with invalid email", (done) => {
      const credentials = {
        email: "wrong@example.com",
        password: "Test@123",
      };

      chai
        .request(app)
        .post("/signin")
        .send(credentials)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("User not found");
          done();
        });
    });

    it("should not sign in with invalid password", (done) => {
      const credentials = {
        email: "test@example.com",
        password: "WrongPassword123",
      };

      chai
        .request(app)
        .post("/signin")
        .send(credentials)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Invalid credentials");
          done();
        });
    });
  });

  describe("GET /profile", () => {
    let authToken;

    beforeEach(async () => {
      // Create and sign in a user
      const user = {
        username: "testuser",
        email: "test@example.com",
        password: "Test@123",
      };
      await chai.request(app).post("/signup").send(user);

      const signinRes = await chai
        .request(app)
        .post("/signin")
        .send({ email: user.email, password: user.password });

      authToken = signinRes.body.token;
    });

    it("should get user profile with valid token", (done) => {
      chai
        .request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("email", "test@example.com");
          expect(res.body).to.have.property("username", "testuser");
          expect(res.body).to.not.have.property("password");
          done();
        });
    });

    it("should not get profile without token", (done) => {
      chai
        .request(app)
        .get("/profile")
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should not get profile with invalid token", (done) => {
      chai
        .request(app)
        .get("/profile")
        .set("Authorization", "Bearer invalidtoken123")
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});
