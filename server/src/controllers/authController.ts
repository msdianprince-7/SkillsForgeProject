import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/Users";
import { registerSchema } from "../validators/authValidators";
import { env } from "../config/env";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.issues });
    return;
    }

    const { name, email, password } = parsed.data;

    const existingUser: IUser | null = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: IUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
  {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,  
  },
  env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
  {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,       
  },
  env.JWT_SECRET,
  { expiresIn: "7d" }
);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};