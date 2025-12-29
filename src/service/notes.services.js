import asyncHandler from "../utils/async-handler.js";
import Notes from "../models/notes.model.js";
import Labels from "../models/label.model.js";
import handleLabels from "../utils/handlaLabels.js";
import cacheService from "../utils/cache.js";
import chaiHttp from "chai-http";

/**
 * Helper function to invalidate user's notes cache
 */
const invalidateUserNotesCache = async (userId) => {
  await cacheService.delPattern(`notes:${userId}:*`);
};

/**
 * Add a new note
 */
const addNote = asyncHandler(async (req, res) => {
  const { title, content, labels, isPinned, isArchived } = req.body;
  const userId = req.user.id;

  const labelIds = await handleLabels(labels, userId);

  const newNote = await Notes.create({
    title,
    content,
    userId,
    labels: labelIds,
    isPinned: isPinned || false,
    isArchived: isArchived || false,
    isTrashed: false,
  });

  // Invalidate cache
  await invalidateUserNotesCache(userId);

  res.status(201).json({ message: "Note added successfully", newNote });
});

/**
 * Get all notes for a user with caching (first 20 notes)
 */
const getNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `notes:${userId}:all`;

  // Try to get from cache
  let notes = await cacheService.get(cacheKey);

  if (!notes) {
    // Fetch from database - only active notes (not trashed)
    notes = await Notes.find({
      userId: userId,
      isTrashed: false,
    })
      .populate("labels")
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(20);

    // Cache for 1 hour
    await cacheService.set(cacheKey, notes, 3600);
  }

  res.status(200).json(notes);
});

/**
 * Get archived notes with caching
 */
const getArchivedNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `notes:${userId}:archived`;

  let notes = await cacheService.get(cacheKey);

  if (!notes) {
    notes = await Notes.find({
      userId: userId,
      isArchived: true,
      isTrashed: false,
    })
      .populate("labels")
      .sort({ updatedAt: -1 })
      .limit(20);

    await cacheService.set(cacheKey, notes, 3600);
  }

  res.status(200).json(notes);
});

/**
 * Get trashed notes with caching
 */
const getTrashedNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `notes:${userId}:trashed`;

  let notes = await cacheService.get(cacheKey);

  if (!notes) {
    notes = await Notes.find({
      userId: userId,
      isTrashed: true,
    })
      .populate("labels")
      .sort({ updatedAt: -1 })
      .limit(20);

    await cacheService.set(cacheKey, notes, 3600);
  }

  res.status(200).json(notes);
});

/**
 * Get pinned notes with caching
 */
const getPinnedNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cacheKey = `notes:${userId}:pinned`;

  let notes = await cacheService.get(cacheKey);

  if (!notes) {
    notes = await Notes.find({
      userId: userId,
      isPinned: true,
      isTrashed: false,
    })
      .populate("labels")
      .sort({ updatedAt: -1 })
      .limit(20);

    await cacheService.set(cacheKey, notes, 3600);
  }

  res.status(200).json(notes);
});

/**
 * Get notes by label with caching
 */
const getNotesByLabel = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { labelId } = req.params;
  const cacheKey = `notes:${userId}:label:${labelId}`;

  let notes = await cacheService.get(cacheKey);

  if (!notes) {
    notes = await Notes.find({
      userId: userId,
      labels: labelId,
      isTrashed: false,
    })
      .populate("labels")
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(20);

    await cacheService.set(cacheKey, notes, 3600);
  }

  res.status(200).json(notes);
});

/**
 * Update a note
 */
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

  note.updatedAt = Date.now();
  await note.save();

  // Invalidate cache
  await invalidateUserNotesCache(userId);

  res.status(200).json({ message: "Note updated successfully", note });
});

/**
 * Archive a note
 */
const archiveNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  const note = await Notes.findOne({ _id: noteId, userId: userId });
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  note.isArchived = !note.isArchived;
  note.updatedAt = Date.now();
  await note.save();

  // Invalidate cache
  await invalidateUserNotesCache(userId);

  res.status(200).json({
    message: note.isArchived
      ? "Note archived successfully"
      : "Note unarchived successfully",
    note,
  });
});

/**
 * Trash a note
 */
const trashNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  const note = await Notes.findOne({ _id: noteId, userId: userId });
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  note.isTrashed = !note.isTrashed;
  note.updatedAt = Date.now();
  await note.save();

  // Invalidate cache
  await invalidateUserNotesCache(userId);

  res.status(200).json({
    message: note.isTrashed
      ? "Note moved to trash successfully"
      : "Note restored successfully",
    note,
  });
});

/**
 * Pin a note
 */
const pinNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  const note = await Notes.findOne({ _id: noteId, userId: userId });
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  note.isPinned = !note.isPinned;
  note.updatedAt = Date.now();
  await note.save();

  // Invalidate cache
  await invalidateUserNotesCache(userId);

  res.status(200).json({
    message: note.isPinned
      ? "Note pinned successfully"
      : "Note unpinned successfully",
    note,
  });
});

/**
 * Permanently delete a note
 */
const deleteNote = asyncHandler(async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  const note = await Notes.findOneAndDelete({ _id: noteId, userId: userId });
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  // Invalidate cache
  await invalidateUserNotesCache(userId);

  res.status(200).json({ message: "Note deleted successfully" });
});

/**
 * Search notes by title and/or label with caching
 * Query params: title (string), label (string - label name)
 */
const searchNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, label } = req.query;

  if (!title && !label) {
    return res.status(400).json({
      message: "Please provide at least one search parameter (title or label)",
    });
  }

  // Create cache key based on search parameters
  const titleKey = title ? title.toLowerCase().trim() : "";
  const labelKey = label ? label.toLowerCase().trim() : "";
  const cacheKey = `notes:${userId}:search:${titleKey}:${labelKey}`;

  // Try to get from cache
  let result = await cacheService.get(cacheKey);

  if (!result) {
    // Build search query
    const searchQuery = {
      userId: userId,
      isTrashed: false, // Exclude trashed notes from search
    };

    // Add title search with case-insensitive regex
    if (title) {
      searchQuery.title = { $regex: title, $options: "i" };
    }

    let notes;

    // If searching by label name, we need to find the label first
    if (label) {
      // Find label by name for this user
      const labelDoc = await Labels.findOne({
        name: label.trim().toLowerCase(),
        userId: userId,
      });

      if (labelDoc) {
        // Add label filter to search query
        searchQuery.labels = labelDoc._id;

        // Search notes with both title and label filters
        notes = await Notes.find(searchQuery)
          .populate("labels")
          .sort({ isPinned: -1, updatedAt: -1 })
          .limit(50);
      } else {
        // Label not found, return empty array
        notes = [];
      }
    } else {
      // Search by title only
      notes = await Notes.find(searchQuery)
        .populate("labels")
        .sort({ isPinned: -1, updatedAt: -1 })
        .limit(50);
    }

    result = {
      count: notes.length,
      notes: notes,
    };

    // Cache search results for 30 minutes
    await cacheService.set(cacheKey, result, 1800);
  }

  res.status(200).json(result);
});

export {
  addNote,
  getNotes,
  getArchivedNotes,
  getTrashedNotes,
  getPinnedNotes,
  getNotesByLabel,
  updateNotes,
  archiveNote,
  trashNote,
  pinNote,
  deleteNote,
  searchNotes,
};
