import mongoose from "mongoose";
import { env } from "./env";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = env.MONGO_URI

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected 🚀");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;