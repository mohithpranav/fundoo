import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

// Create compound unique index on name and userId
// This ensures label names are unique per user, not globally
LabelSchema.index({ name: 1, userId: 1 }, { unique: true });

export default mongoose.model("labels", LabelSchema);
