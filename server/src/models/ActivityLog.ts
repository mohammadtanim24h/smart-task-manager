import mongoose from "mongoose";

export interface IActivityLog extends mongoose.Document {
  message: string;
  taskId: mongoose.Types.ObjectId;
  fromMemberName: string;
  toMemberName: string;
  fromMemberId?: mongoose.Types.ObjectId | null;
  toMemberId?: mongoose.Types.ObjectId | null;
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
    fromMemberName: {
      type: String,
      required: [true, "From member name is required"],
      trim: true,
    },
    toMemberName: {
      type: String,
      required: [true, "To member name is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  activityLogSchema
);

