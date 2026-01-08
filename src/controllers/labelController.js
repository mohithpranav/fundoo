import Label from "../models/label.model.js";
import Notes from "../models/notes.model.js";
import asyncHandler from "../utils/async-handler.js";

// Create a new label
export const createLabel = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Label name is required" });
  }

  const trimmedName = name.trim();
  const normalizedName = trimmedName.toLowerCase();

  // Check if label already exists for this user (case-insensitive)
  const existingLabel = await Label.findOne({
    name: normalizedName,
    userId,
  });

  if (existingLabel) {
    return res.status(400).json({ message: "Label already exists" });
  }

  // Create label with normalized (lowercase) name
  const label = await Label.create({
    name: normalizedName,
    userId,
  });

  res.status(201).json({
    message: "Label created successfully",
    label,
  });
});

// Get all labels for the user
export const getAllLabels = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const labels = await Label.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    message: "Labels retrieved successfully",
    labels,
  });
});

// Update a label
export const updateLabel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Label name is required" });
  }

  const normalizedName = name.trim().toLowerCase();

  // Check if the label exists and belongs to the user
  const label = await Label.findOne({ _id: id, userId });

  if (!label) {
    return res.status(404).json({ message: "Label not found" });
  }

  // Check if another label with the same name exists for this user
  const existingLabel = await Label.findOne({
    name: normalizedName,
    userId,
    _id: { $ne: id },
  });

  if (existingLabel) {
    return res.status(400).json({ message: "Label name already exists" });
  }

  label.name = normalizedName;
  await label.save();

  res.status(200).json({
    message: "Label updated successfully",
    label,
  });
});

// Delete a label
export const deleteLabel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if the label exists and belongs to the user
  const label = await Label.findOne({ _id: id, userId });

  if (!label) {
    return res.status(404).json({ message: "Label not found" });
  }

  // Remove the label from all notes
  await Notes.updateMany({ labels: id }, { $pull: { labels: id } });

  // Delete the label
  await Label.deleteOne({ _id: id, userId });

  res.status(200).json({
    message: "Label deleted successfully",
  });
});
