import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Application, Request, Response } from "express";
import authRoutes from "./routes/authRoutes";
import connectDB from "./config/db";
import { protect, AuthRequest,authorize } from "./middlewares/authMiddlewares";
import skillRoutes from "./routes/skillRoutes";
import { errorHandler } from "./middlewares/errorMiddlewares";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env";







const app: Application = express();

const PORT: number = Number(env.PORT);

// Connect Database
connectDB();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// Security Headers
app.use(helmet());

// Logging
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: "Too many requests, please try again later."
});

app.use("/api", limiter);

app.get("/api/profile", protect, (req: AuthRequest, res: Response) => {
  res.json({
    message: "Protected profile route 🔐",
    user: req.user
  });
});
app.get(
  "/api/admin",
  protect,
  authorize("admin"),
  (req: AuthRequest, res: Response) => {
    res.json({
      message: "Welcome Admin 👑",
      user: req.user
    });
  }
);

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("TypeScript Server Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});