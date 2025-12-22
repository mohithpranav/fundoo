import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { type: String, required: true, unique: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("labels", LabelSchema);
