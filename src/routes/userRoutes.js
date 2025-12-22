import { Router } from "express";
import { signin, signup, userProfile } from "../controllers/authController.js";
import { resetPassword } from "../service/resetPassword.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { addNote, getNotes, updateNotes } from "../service/notes.services.js";

const router = Router();

//  auth routes
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", authMiddleware, userProfile);
router.put("/resetPassword", authMiddleware, resetPassword);

// routes for notes
router.post("/addNotes", authMiddleware, addNote);
router.get("/getNotes", authMiddleware, getNotes);
router.put("/updateNotes/:id", authMiddleware, updateNotes);

export default router;
