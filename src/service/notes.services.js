import asyncHandler from "../utils/async-handler.js";
import Notes from "../models/notes.model.js";
import handleLabels from "../utils/handlaLabels.js";

const addNote = asyncHandler(async (req, res) => {
  const { title, content, labels } = req.body;
  const userId = req.user.id;

  const labelIds = await handleLabels(labels, userId);

  const newNote = await Notes.create({
    title,
    content,
    userId,
    labels: labelIds,
  });
  console.log("Incoming labels:", labels, Array.isArray(labels));
  res.status(201).json({ message: "Note added successfully", newNote });
});

const getNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notes = await Notes.find({
    userId: userId,
  });
  res.status(200).json(notes);
});

const updateNotes = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const { title, content, labels } = req.body;
  const userId = req.user.id;
  const note = await Notes.findOne({ _id: noteId, userId: userId });
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }
  if (title !== undefined) {
    note.title = title;
  }

  if (content !== undefined) {
    note.content = content;
  }

  if (labels !== undefined) {
    note.labels = await handleLabels(labels, userId);
  }

  await note.save();
  res.status(200).json({ message: "Note updated successfully", note });
});

const deleteNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const note = await Notes.findOneAndDelete({ _id: noteId, userId: userId });
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }
  res.status(200).json({ message: "Note deleted successfully" });
});

export { addNote, getNotes, updateNotes, deleteNote };
