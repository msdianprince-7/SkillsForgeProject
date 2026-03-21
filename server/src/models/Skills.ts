import mongoose, { Document, Schema } from "mongoose";

export interface IResource {
  title: string;
  url: string;
  type: "youtube" | "linkedin" | "documentation" | "github" | "article" | "other";
}

export interface IMilestone {
  title: string;
  completed: boolean;
}

export interface ISkill extends Document {
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  category: string;
  tags: string[];
  targetDate: Date | null;
  milestones: IMilestone[];
  resources: IResource[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["youtube", "linkedin", "documentation", "github", "article", "other"],
      default: "other"
    }
  },
  { _id: true }
);

const milestoneSchema = new Schema<IMilestone>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
  },
  { _id: true }
);

const skillSchema: Schema<ISkill> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    category: {
      type: String,
      trim: true,
      default: "General"
    },
    tags: {
      type: [String],
      default: []
    },
    targetDate: {
      type: Date,
      default: null
    },
    milestones: {
      type: [milestoneSchema],
      default: []
    },
    resources: {
      type: [resourceSchema],
      default: []
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