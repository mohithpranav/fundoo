import asyncHandler from "../utils/async-handler.js";
import Notes from "../models/notes.model.js";

const addNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;
  const newNote = await Notes.create({
    title,
    content,
    userId,
  });
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
  const { title, content } = req.body;
  const userId = req.user.id;
  const note = await Notes.findOne({ _id: noteId, userId: userId });
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }
  note.title = title || note.title;
  note.content = content || note.content;
  await note.save();
  res.status(200).json({ message: "Note updated successfully", note });
});

export { addNote, getNotes, updateNotes };
