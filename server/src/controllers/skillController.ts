import { NextFunction, Request, Response } from "express";
import Skill, { ISkill } from "../models/Skills";
import { AuthRequest } from "../middlewares/authMiddlewares";

export const createSkill = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, level } = req.body;

    const skill: ISkill = await Skill.create({
      title,
      description,
      level,
      createdBy: req.user?._id
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSkills = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const levelFilter = req.query.level as string | undefined;
  const search = req.query.search as string | undefined;
  const sort = req.query.sort as string || "-createdAt";

  const filter: any = {};

  if (levelFilter) {
    filter.level = levelFilter;
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const skills = await Skill.find(filter)
    .populate("createdBy", "name email")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Skill.countDocuments(filter);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    data: skills
  });
};

export const getSkillById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const skill = await Skill.findById(req.params.id).populate(
    "createdBy",
    "name email"
  );

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  res.json(skill);
};

export const updateSkill = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    skill.title = req.body.title || skill.title;
    skill.description = req.body.description || skill.description;
    skill.level = req.body.level || skill.level;

    await skill.save();

    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteSkill = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    await skill.deleteOne();

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};