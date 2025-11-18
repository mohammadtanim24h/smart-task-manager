import mongoose from "mongoose";

export interface IActivityLog extends mongoose.Document {
  message: string;
  taskId: mongoose.Types.ObjectId;
  fromMemberId: mongoose.Types.ObjectId;
  toMemberId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const activityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    message: {
      type: String,
      required: [true, "Activity log message is required"],
      trim: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task ID is required"],
    },
    fromMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "From member ID is required"],
    },
    toMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "To member ID is required"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically (createdAt serves as timestamp)
  }
);

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  activityLogSchema
);

