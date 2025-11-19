import mongoose from "mongoose";

export type Priority = "Low" | "Medium" | "High";
export type Status = "Pending" | "In Progress" | "Done";

export interface ITask extends mongoose.Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assignedMemberName?: string | null;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema<ITask>(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },
    assignedMemberName: {
      type: String,
      default: null,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "Priority is required"],
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Done"],
      required: [true, "Status is required"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export const Task = mongoose.model<ITask>("Task", taskSchema);

