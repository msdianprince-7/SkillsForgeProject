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
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { title, description, level, progress, category, tags, targetDate, milestones, resources } = req.body;

    if (!title || !description) {
      res.status(400).json({ message: "Title and description are required" });
      return;
    }

    const skill: ISkill = await Skill.create({
      title,
      description,
      level,
      progress: progress || 0,
      category: category || "General",
      tags: tags || [],
      targetDate: targetDate || null,
      milestones: milestones || [],
      resources: resources || [],
      createdBy: req.user._id,
    });

    res.status(201).json(skill);
  } catch (error) {
    next(error);
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
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const levelFilter = req.query.level as string | undefined;
    const categoryFilter = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const allowedSorts = ["-createdAt", "createdAt", "title", "-title", "level", "-level", "-progress", "progress"];
    const rawSort = req.query.sort as string;
    const sort = allowedSorts.includes(rawSort) ? rawSort : "-createdAt";

    const filter: Record<string, any> = {};

    if (levelFilter) filter.level = levelFilter;
    if (categoryFilter) filter.category = categoryFilter;
    if (search) filter.title = { $regex: search, $options: "i" };

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
    next(error);
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
    const skill = await Skill.findById(req.params.id).populate("createdBy", "name email");

    if (!skill) {
      res.status(404);
      next(new Error("Skill not found"));
      return;
    }

    res.json(skill);
  } catch (error) {
    next(error);
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

    const isOwner = skill.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "Forbidden: You do not own this skill" });
      return;
    }

    // Update all fields
    skill.title = req.body.title || skill.title;
    skill.description = req.body.description || skill.description;
    skill.level = req.body.level || skill.level;
    if (req.body.progress !== undefined) skill.progress = req.body.progress;
    if (req.body.category !== undefined) skill.category = req.body.category;
    if (req.body.tags !== undefined) skill.tags = req.body.tags;
    if (req.body.targetDate !== undefined) skill.targetDate = req.body.targetDate;
    if (req.body.milestones !== undefined) skill.milestones = req.body.milestones;
    if (req.body.resources !== undefined) skill.resources = req.body.resources;

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

    const isOwner = skill.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ message: "Forbidden: You do not own this skill" });
      return;
    }

    await skill.deleteOne();
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET SKILL STATS (for analytics)
// ─────────────────────────────────────────
export const getSkillStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user._id;

    const [
      totalSkills,
      byLevel,
      byCategory,
      avgProgress,
      recentSkills,
    ] = await Promise.all([
      Skill.countDocuments({ createdBy: userId }),
      Skill.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: "$level", count: { $sum: 1 } } },
      ]),
      Skill.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Skill.aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: null, avg: { $avg: "$progress" } } },
      ]),
      Skill.find({ createdBy: userId })
        .sort("-createdAt")
        .limit(5)
        .select("title level progress createdAt"),
    ]);

    // Skills with approaching deadlines
    const upcomingDeadlines = await Skill.find({
      createdBy: userId,
      targetDate: { $gte: new Date() },
    })
      .sort("targetDate")
      .limit(5)
      .select("title targetDate progress level");

    // Milestones stats
    const milestoneStats = await Skill.aggregate([
      { $match: { createdBy: userId } },
      { $unwind: { path: "$milestones", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          totalMilestones: { $sum: 1 },
          completedMilestones: {
            $sum: { $cond: ["$milestones.completed", 1, 0] },
          },
        },
      },
    ]);

    const levelMap: Record<string, number> = {};
    byLevel.forEach((item: any) => {
      levelMap[item._id] = item.count;
    });

    const categoryMap: { name: string; count: number }[] = byCategory.map(
      (item: any) => ({ name: item._id || "Uncategorized", count: item.count })
    );

    res.json({
      totalSkills,
      averageProgress: Math.round(avgProgress[0]?.avg || 0),
      byLevel: {
        Beginner: levelMap["Beginner"] || 0,
        Intermediate: levelMap["Intermediate"] || 0,
        Advanced: levelMap["Advanced"] || 0,
      },
      byCategory: categoryMap,
      recentSkills,
      upcomingDeadlines,
      milestones: {
        total: milestoneStats[0]?.totalMilestones || 0,
        completed: milestoneStats[0]?.completedMilestones || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};