import { Request, Response, NextFunction } from "express";
import Skill, { ISkill } from "../models/Skills";
import { AuthRequest } from "../middlewares/authMiddlewares";

// ─────────────────────────────────────────
// CREATE SKILL
// ─────────────────────────────────────────
export const createSkill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Guard: user must be authenticated
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { title, description, level } = req.body;

    // Guard: required fields
    if (!title || !description) {
      res.status(400).json({ message: "Title and description are required" });
      return;
    }

    const skill: ISkill = await Skill.create({
      title,
      description,
      level,
      createdBy: req.user._id,
    });

    res.status(201).json(skill);
  } catch (error) {
    next(error); // passes to global errorHandler
  }
};

// ─────────────────────────────────────────
// GET ALL SKILLS (paginated, filtered, sorted)
// ─────────────────────────────────────────
export const getSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const levelFilter = req.query.level as string | undefined;
    const search = req.query.search as string | undefined;

    // Whitelist allowed sort values to prevent injection
    const allowedSorts = ["-createdAt", "createdAt", "title", "-title", "level", "-level"];
    const rawSort = req.query.sort as string;
    const sort = allowedSorts.includes(rawSort) ? rawSort : "-createdAt";

    const filter: Record<string, any> = {};

    if (levelFilter) {
      filter.level = levelFilter;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const [skills, total] = await Promise.all([
      Skill.find(filter)
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Skill.countDocuments(filter),
    ]);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: skills,
    });
  } catch (error) {
    next(error); // passes to global errorHandler
  }
};

// ─────────────────────────────────────────
// GET SKILL BY ID
// ─────────────────────────────────────────
export const getSkillById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!skill) {
      res.status(404);
      next(new Error("Skill not found")); // passes to global errorHandler
      return;
    }

    res.json(skill);
  } catch (error) {
    next(error); // handles invalid ObjectId format etc.
  }
};

// ─────────────────────────────────────────
// UPDATE SKILL
// ─────────────────────────────────────────
export const updateSkill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Guard: user must be authenticated
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404);
      next(new Error("Skill not found"));
      return;
    }

    // Optional: only allow the creator to update
    if (skill.createdBy?.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Forbidden: You do not own this skill" });
      return;
    }

    skill.title = req.body.title || skill.title;
    skill.description = req.body.description || skill.description;
    skill.level = req.body.level || skill.level;

    await skill.save();

    res.json(skill);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// DELETE SKILL
// ─────────────────────────────────────────
export const deleteSkill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Guard: user must be authenticated
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404);
      next(new Error("Skill not found"));
      return;
    }

    // Optional: only allow the creator to delete
    if (skill.createdBy?.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: "Forbidden: You do not own this skill" });
      return;
    }

    await skill.deleteOne();

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    next(error);
  }
};