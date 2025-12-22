import { Router } from "express";
import { signin, signup, UserProfile } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/profile", authMiddleware, UserProfile);

export default router;
