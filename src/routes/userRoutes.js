import { Router } from "express";
import { signin, signup, userProfile } from "../controllers/authController.js";
import { resetPassword } from "../service/resetPassword.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
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
  addCollaborator,
} from "../service/notes.services.js";

const router = Router();

//  auth routes
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", authMiddleware, userProfile);
router.put("/resetPassword", authMiddleware, resetPassword);

// routes for notes
router.post("/addNotes", authMiddleware, addNote);
router.get("/getNotes", authMiddleware, getNotes);
router.get("/notes/search", authMiddleware, searchNotes);
router.get("/notes/archived", authMiddleware, getArchivedNotes);
router.get("/notes/trashed", authMiddleware, getTrashedNotes);
router.get("/notes/pinned", authMiddleware, getPinnedNotes);
router.get("/notes/label/:labelId", authMiddleware, getNotesByLabel);

router.put("/updateNotes/:id", authMiddleware, updateNotes);
router.put("/notes/:id/archive", authMiddleware, archiveNote);
router.put("/notes/:id/trash", authMiddleware, trashNote);
router.put("/notes/:id/pin", authMiddleware, pinNote);
router.post("/notes/:id/collaborators", authMiddleware, addCollaborator);
router.delete("/deleteNote/:id", authMiddleware, deleteNote);

export default router;
