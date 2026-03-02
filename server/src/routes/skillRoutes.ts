import { Router } from "express";
import {
  createSkill,
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill
} from "../controllers/skillController";
import { protect, authorize } from "../middlewares/authMiddlewares";

const router = Router();



router.get("/", getSkills);
router.get("/:id", getSkillById);

router.post("/", protect, authorize("admin"), createSkill);
router.put("/:id", protect, authorize("admin"), updateSkill);
router.delete("/:id", protect, authorize("admin"), deleteSkill);

router.get("/", getSkills);
router.post("/", protect, authorize("admin"), createSkill);

export default router;