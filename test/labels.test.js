import { expect } from "chai";
import Labels from "../src/models/label.model.js";
import handleLabels from "../src/utils/handlaLabels.js";
import mongoose from "mongoose";

describe("Labels Utility Tests", () => {
  let userId;

  before(() => {
    userId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    await Labels.deleteMany({});
  });

  after(async () => {
    await Labels.deleteMany({});
    await mongoose.connection.close();
  });

  describe("handleLabels function", () => {
    it("should return empty array when labels is not an array", async () => {
      const result = await handleLabels(null, userId);
      expect(result).to.be.an("array");
      expect(result).to.have.length(0);
    });

    it("should return empty array when labels array is empty", async () => {
      const result = await handleLabels([], userId);
      expect(result).to.be.an("array");
      expect(result).to.have.length(0);
    });

    it("should create new labels and return their IDs", async () => {
      const labelNames = ["todos", "important", "work"];
      const result = await handleLabels(labelNames, userId);

      expect(result).to.be.an("array");
      expect(result).to.have.length(3);

      // Verify labels were created in database
      const labelsInDb = await Labels.find({ userId });
      expect(labelsInDb).to.have.length(3);
    });

    it("should normalize label names (trim and lowercase)", async () => {
      const labelNames = ["  TODOS  ", "Important", "work"];
      await handleLabels(labelNames, userId);

      const labelsInDb = await Labels.find({ userId });
      expect(labelsInDb[0].name).to.equal("todos");
      expect(labelsInDb[1].name).to.equal("important");
      expect(labelsInDb[2].name).to.equal("work");
    });

    it("should reuse existing labels instead of creating duplicates", async () => {
      // Create initial labels
      const firstCall = await handleLabels(["todos", "work"], userId);
      expect(firstCall).to.have.length(2);

      // Try to create same labels again
      const secondCall = await handleLabels(["todos", "work"], userId);
      expect(secondCall).to.have.length(2);

      // Should only have 2 labels in database, not 4
      const labelsInDb = await Labels.find({ userId });
      expect(labelsInDb).to.have.length(2);

      // IDs should match
      expect(firstCall[0].toString()).to.equal(secondCall[0].toString());
      expect(firstCall[1].toString()).to.equal(secondCall[1].toString());
    });

    it("should create new labels and reuse existing ones in same call", async () => {
      // Create one label first
      await Labels.create({ name: "todos", userId });

      // Call with both existing and new labels
      const result = await handleLabels(["todos", "important"], userId);
      expect(result).to.have.length(2);

      // Should have 2 labels total, not 3
      const labelsInDb = await Labels.find({ userId });
      expect(labelsInDb).to.have.length(2);
    });

    it("should handle labels for different users separately", async () => {
      const user1Id = new mongoose.Types.ObjectId();
      const user2Id = new mongoose.Types.ObjectId();

      await handleLabels(["todos"], user1Id);
      await handleLabels(["todos"], user2Id);

      const user1Labels = await Labels.find({ userId: user1Id });
      const user2Labels = await Labels.find({ userId: user2Id });

      expect(user1Labels).to.have.length(1);
      expect(user2Labels).to.have.length(1);
      expect(user1Labels[0]._id.toString()).to.not.equal(
        user2Labels[0]._id.toString()
      );
    });

    it("should return ObjectIds that can be stored in notes", async () => {
      const result = await handleLabels(["todos"], userId);

      expect(result[0]).to.be.instanceOf(mongoose.Types.ObjectId);
    });
  });
});
