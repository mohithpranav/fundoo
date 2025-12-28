import { expect } from "chai";
import chai from "chai";
import chaiHttp from "chai-http";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import Notes from "../src/models/notes.model.js";
import Labels from "../src/models/label.model.js";
import mongoose from "mongoose";

chai.use(chaiHttp);

describe("Notes API Tests", () => {
  let authToken;
  let userId;

  // Setup: Create a user and get auth token
  before(async () => {
    await User.deleteMany({});
    await Notes.deleteMany({});
    await Labels.deleteMany({});

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
    const userDoc = await User.findOne({ email: user.email });
    userId = userDoc._id;
  });

  beforeEach(async () => {
    await Notes.deleteMany({});
    await Labels.deleteMany({});
  });

  after(async () => {
    await User.deleteMany({});
    await Notes.deleteMany({});
    await Labels.deleteMany({});
    await mongoose.connection.close();
  });

  describe("POST /addNotes", () => {
    it("should create a new note successfully", (done) => {
      const newNote = {
        title: "Test Note",
        content: "This is a test note",
      };

      chai
        .request(app)
        .post("/addNotes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newNote)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property(
            "message",
            "Note added successfully"
          );
          expect(res.body).to.have.property("newNote");
          expect(res.body.newNote).to.have.property("title", newNote.title);
          expect(res.body.newNote).to.have.property("content", newNote.content);
          expect(res.body.newNote).to.have.property("userId");
          done();
        });
    });

    it("should create a note with labels", (done) => {
      const newNote = {
        title: "Cooking",
        content: "Learn to cook pasta",
        labels: ["todos", "important"],
      };

      chai
        .request(app)
        .post("/addNotes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newNote)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property(
            "message",
            "Note added successfully"
          );
          expect(res.body.newNote).to.have.property("title", newNote.title);
          expect(res.body.newNote).to.have.property("labels");
          expect(res.body.newNote.labels).to.be.an("array");
          expect(res.body.newNote.labels).to.have.length(2);
          done();
        });
    });

    it("should not create a note without authentication", (done) => {
      const newNote = {
        title: "Test Note",
        content: "This is a test note",
      };

      chai
        .request(app)
        .post("/addNotes")
        .send(newNote)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should not create a note with missing required fields", (done) => {
      const invalidNote = {
        title: "Test Note",
        // missing content
      };

      chai
        .request(app)
        .post("/addNotes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidNote)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe("GET /getNotes", () => {
    beforeEach(async () => {
      // Create some test notes
      await Notes.create({
        title: "Note 1",
        content: "Content 1",
        userId,
      });
      await Notes.create({
        title: "Note 2",
        content: "Content 2",
        userId,
      });
    });

    it("should get all notes for authenticated user", (done) => {
      chai
        .request(app)
        .get("/getNotes")
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(res.body).to.have.length(2);
          expect(res.body[0]).to.have.property("title");
          expect(res.body[0]).to.have.property("content");
          done();
        });
    });

    it("should return empty array when user has no notes", async () => {
      await Notes.deleteMany({});

      const res = await chai
        .request(app)
        .get("/getNotes")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.length(0);
    });

    it("should not get notes without authentication", (done) => {
      chai
        .request(app)
        .get("/getNotes")
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe("PUT /updateNotes/:id", () => {
    let noteId;

    beforeEach(async () => {
      const note = await Notes.create({
        title: "Original Title",
        content: "Original Content",
        userId,
      });
      noteId = note._id;
    });

    it("should update a note successfully", (done) => {
      const updates = {
        title: "Updated Title",
        content: "Updated Content",
      };

      chai
        .request(app)
        .put(`/updateNotes/${noteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updates)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property(
            "message",
            "Note updated successfully"
          );
          expect(res.body.note).to.have.property("title", updates.title);
          expect(res.body.note).to.have.property("content", updates.content);
          done();
        });
    });

    it("should update note with new labels", (done) => {
      const updates = {
        title: "Updated Title",
        labels: ["work", "urgent"],
      };

      chai
        .request(app)
        .put(`/updateNotes/${noteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updates)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.note).to.have.property("labels");
          expect(res.body.note.labels).to.be.an("array");
          expect(res.body.note.labels).to.have.length(2);
          done();
        });
    });

    it("should not update non-existent note", (done) => {
      const fakeId = new mongoose.Types.ObjectId();
      const updates = {
        title: "Updated Title",
      };

      chai
        .request(app)
        .put(`/updateNotes/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updates)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("message", "Note not found");
          done();
        });
    });

    it("should not update note without authentication", (done) => {
      const updates = {
        title: "Updated Title",
      };

      chai
        .request(app)
        .put(`/updateNotes/${noteId}`)
        .send(updates)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe("DELETE /deleteNote/:id", () => {
    let noteId;

    beforeEach(async () => {
      const note = await Notes.create({
        title: "Note to Delete",
        content: "This will be deleted",
        userId,
      });
      noteId = note._id;
    });

    it("should delete a note successfully", (done) => {
      chai
        .request(app)
        .delete(`/deleteNote/${noteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property(
            "message",
            "Note deleted successfully"
          );
          done();
        });
    });

    it("should not delete non-existent note", (done) => {
      const fakeId = new mongoose.Types.ObjectId();

      chai
        .request(app)
        .delete(`/deleteNote/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("message", "Note not found");
          done();
        });
    });

    it("should not delete note without authentication", (done) => {
      chai
        .request(app)
        .delete(`/deleteNote/${noteId}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});
