import mongoose, { Document, Schema } from "mongoose";

export interface ISkill extends Document {
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema: Schema<ISkill> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISkill>("Skill", skillSchema);