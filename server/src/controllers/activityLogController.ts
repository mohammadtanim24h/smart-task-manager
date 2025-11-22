import { type Request, type Response } from "express";
import { ActivityLog } from "../models/ActivityLog.js";

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .populate("taskId", "title");

    res.status(200).json({ logs });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({ message: "Server error while fetching activity logs" });
  }
};
