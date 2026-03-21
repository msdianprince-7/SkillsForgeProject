import { Router } from "express";
import { getMe, updateMe } from "../controllers/userController";
import { protect } from "../middlewares/authMiddlewares";

const router = Router();

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

export default router;
