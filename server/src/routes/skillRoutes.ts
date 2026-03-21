import { Router } from "express";
import {
  createSkill,
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  getSkillStats,
} from "../controllers/skillController";
import { protect } from "../middlewares/authMiddlewares";

const router = Router();

// ── Public routes ─────────────────────────────
router.get("/", getSkills);
router.get("/stats", protect, getSkillStats);
router.get("/:id", getSkillById);

// ── Authenticated user routes ─────────────────
router.post("/", protect, createSkill);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);

export default router;