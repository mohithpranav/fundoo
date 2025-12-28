import { expect } from "chai";
import chai from "chai";
import chaiHttp from "chai-http";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

chai.use(chaiHttp);

describe("Reset Password API Tests", () => {
  let authToken;
  let userEmail = "test@example.com";

  before(async () => {
    await User.deleteMany({});

    const user = {
      username: "testuser",
      email: userEmail,
      password: "OldPassword@123",
    };

    await chai.request(app).post("/signup").send(user);

    const signinRes = await chai
      .request(app)
      .post("/signin")
      .send({ email: user.email, password: user.password });

    authToken = signinRes.body.token;
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe("PUT /resetPassword", () => {
    it("should reset password with valid current password", (done) => {
      const passwordData = {
        currentPassword: "OldPassword@123",
        newPassword: "NewPassword@123",
      };

      chai
        .request(app)
        .put("/resetPassword")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          done();
        });
    });

    it("should not reset password without authentication", (done) => {
      const passwordData = {
        currentPassword: "OldPassword@123",
        newPassword: "NewPassword@123",
      };

      chai
        .request(app)
        .put("/resetPassword")
        .send(passwordData)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should not reset password with invalid current password", async () => {
      const passwordData = {
        currentPassword: "WrongPassword@123",
        newPassword: "NewPassword@123",
      };

      const res = await chai
        .request(app)
        .put("/resetPassword")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData);

      expect(res).to.have.status(400);
    });

    it("should verify new password is hashed in database", async () => {
      // Reset to a known password
      const newPassword = "VerifiedPassword@123";
      const passwordData = {
        currentPassword: "NewPassword@123",
        newPassword: newPassword,
      };

      await chai
        .request(app)
        .put("/resetPassword")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData);

      // Get user from database
      const user = await User.findOne({ email: userEmail });

      // Verify password is hashed (not plaintext)
      expect(user.password).to.not.equal(newPassword);

      // Verify password can be validated with bcrypt
      const isValid = await bcrypt.compare(newPassword, user.password);
      expect(isValid).to.be.true;
    });
  });
});
