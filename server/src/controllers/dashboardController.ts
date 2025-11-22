import { type Request, type Response } from "express";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { Team } from "../models/Team.js";
import { ActivityLog } from "../models/ActivityLog.js";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // 1. Get teams owned by the user
    const userTeams = await Team.find({ ownerId: req.user.id });
    const teamIds = userTeams.map((team) => team._id);

    // 2. Get projects in those teams
    const projects = await Project.find({ teamId: { $in: teamIds } }).select("_id");
    const projectIds = projects.map((p) => p._id);

    // 3. Get total projects count
    const totalProjects = projects.length;

    // 4. Get total tasks count
    const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });

    // 5. Get member workload summary
    // Group tasks by assignedMemberName and count them
    const workload = await Task.aggregate([
      {
        $match: { projectId: { $in: projectIds } },
      },
      {
        $group: {
          _id: "$assignedMemberName",
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
          done: {
            $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          memberName: { $ifNull: ["$_id", "Unassigned"] },
          count: 1,
          pending: 1,
          inProgress: 1,
          done: 1,
        },
      },
    ]);

    // Create a map of member capacities from userTeams
    const memberCapacities: Record<string, number> = {};
    userTeams.forEach((team) => {
      team.members.forEach((member) => {
        memberCapacities[member.name] = member.capacity;
      });
    });

    // Add capacity to workload
    const workloadWithCapacity = workload.map((w) => ({
      ...w,
      capacity: memberCapacities[w.memberName] || 0,
    }));

    // 6. Get last 5 activity logs
    const tasks = await Task.find({ projectId: { $in: projectIds } }).select("_id");
    const taskIds = tasks.map((t) => t._id);

    const activityLogs = await ActivityLog.find({ taskId: { $in: taskIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("taskId", "title");

    res.status(200).json({
      totalProjects,
      totalTasks,
      workload: workloadWithCapacity,
      activityLogs,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Server error while fetching dashboard stats" });
  }
};
