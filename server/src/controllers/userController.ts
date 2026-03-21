import { Response, NextFunction } from "express";
import User from "../models/Users";
import { AuthRequest } from "../middlewares/authMiddlewares";

// ─────────────────────────────────────────
// GET CURRENT USER PROFILE
// ─────────────────────────────────────────
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// UPDATE CURRENT USER PROFILE
// ─────────────────────────────────────────
export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (req.body.name) {
      user.name = req.body.name;
    }

    await user.save();

    const updated = await User.findById(user._id).select("-password");
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
