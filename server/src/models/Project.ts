import mongoose from "mongoose";

export interface IProject extends mongoose.Document {
  title: string;
  description: string;
  teamId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team ID is required"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export const Project = mongoose.model<IProject>("Project", projectSchema);

