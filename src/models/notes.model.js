import mongoose from "mongoose";
const Schema = mongoose.Schema;

const NotesSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Labels",
    },
  ],

  isArchived: { type: Boolean, default: false },
  isTrashed: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
});

export default mongoose.model("Notes", NotesSchema);
