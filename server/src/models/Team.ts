import mongoose from "mongoose";

export interface IMember {
  name: string;
  role: string;
  capacity: number;
  userId?: mongoose.Types.ObjectId;
}

export interface ITeam extends mongoose.Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  members: IMember[];
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new mongoose.Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, "Member name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Member role is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Member capacity is required"],
      min: [0, "Capacity must be a positive number"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    members: {
      type: [memberSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export const Team = mongoose.model<ITeam>("Team", teamSchema);

