import { type Request, type Response } from "express";
import { Task } from "../models/Task.js";
import { Project, type IProject } from "../models/Project.js";
import { Team } from "../models/Team.js";
import { ActivityLog } from "../models/ActivityLog.js";

// Helper function to verify project access
const verifyProjectAccess = async (projectId: string, userId: string): Promise<boolean> => {
  const project = await Project.findById(projectId);
  if (!project) return false;

  const team = await Team.findOne({ _id: project.teamId, ownerId: userId });
  return !!team;
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, title, description, assignedMemberName, priority, status } = req.body;

    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: "Project ID is required" });
      return;
    }

    if (!title) {
      res.status(400).json({ message: "Task title is required" });
      return;
    }

    if (!description) {
      res.status(400).json({ message: "Task description is required" });
      return;
    }

    // Verify that the project exists and belongs to a team owned by the user
    const hasAccess = await verifyProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      res.status(404).json({ message: "Project not found or you don't have access to it" });
      return;
    }

    const task = await Task.create({
      projectId,
      title: title.trim(),
      description: description.trim(),
      assignedMemberName: assignedMemberName || null,
      priority: priority || "Low",
      status: status || "Pending",
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error: any) {
    console.error("Create task error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(", ") });
      return;
    }
    res.status(500).json({ message: "Server error while creating task" });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { projectId, assignedMemberName } = req.query;

    // Get all teams owned by the user
    const userTeams = await Team.find({ ownerId: req.user.id });
    const teamIds = userTeams.map((team) => team._id);

    // Get all projects that belong to user's teams
    const userProjects = await Project.find({ teamId: { $in: teamIds } });
    const projectIds = userProjects.map((project) => project._id);

    // Build query
    let query: any = { projectId: { $in: projectIds } };

    // Filter by projectId if provided
    if (projectId) {
      const project = userProjects.find((p) => p._id.toString() === projectId);
      if (!project) {
        res.status(404).json({ message: "Project not found or you don't have access to it" });
        return;
      }
      query.projectId = project._id;
    }

    // Filter by assignedMemberId if provided
    if (assignedMemberName) {
      query.assignedMemberName = assignedMemberName;
    }

    const tasks = await Task.find(query)
      .populate("projectId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error while fetching tasks" });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { id } = req.params;
    const { title, description, assignedMemberName, priority, status, projectId } = req.body;

    // Find the task
    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Verify that the project associated with the task is accessible by the user
    const hasAccess = await verifyProjectAccess(task.projectId.toString(), req.user.id);
    if (!hasAccess) {
      res.status(403).json({ message: "You don't have access to this task" });
      return;
    }

    // If projectId is being updated, verify the new project exists and is accessible
    if (projectId && projectId !== task.projectId.toString()) {
      const hasNewProjectAccess = await verifyProjectAccess(projectId, req.user.id);
      if (!hasNewProjectAccess) {
        res.status(404).json({ message: "New project not found or you don't have access to it" });
        return;
      }
      task.projectId = projectId as any;
    }

    const oldAssignedMemberName = task.assignedMemberName;

    if (typeof title === "string" && title.trim().length > 0) {
      task.title = title.trim();
    }

    if (typeof description === "string" && description.trim().length > 0) {
      task.description = description.trim();
    }

    if (assignedMemberName !== undefined) {
      task.assignedMemberName = assignedMemberName || null;
    }

    if (priority && ["Low", "Medium", "High"].includes(priority)) {
      task.priority = priority;
    }

    if (status && ["Pending", "In Progress", "Done"].includes(status)) {
      task.status = status;
    }

    await task.save();

    // Log reassignment if applicable
    if (
      assignedMemberName !== undefined &&
      oldAssignedMemberName !== task.assignedMemberName
    ) {
      const oldName = oldAssignedMemberName || "";
      const newName = task.assignedMemberName || "";
      
      // Only log if there's an actual change involving assignment
      if (oldName && newName) {
        await ActivityLog.create({
          message: `Task '${task.title}' reassigned from '${oldName}' to '${newName}'.`,
          taskId: task._id,
          fromMemberName: oldName,
          toMemberName: newName,
        });
      }
      else if (!oldName && newName) {
        await ActivityLog.create({
          message: `Unassigned Task '${task.title}' assigned to '${newName}'.`,
          taskId: task._id,
          fromMemberName: "",
          toMemberName: newName,
        });
      } else if (!newName && oldName) {
        await ActivityLog.create({
          message: `Task '${task.title}' unassigned from '${oldName}'.`,
          taskId: task._id,
          fromMemberName: oldName,
          toMemberName: "",
        });
      }
    }

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error: any) {
    console.error("Update task error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(", ") });
      return;
    }
    res.status(500).json({ message: "Server error while updating task" });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { id } = req.params;

    // Find the task
    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Verify that the project associated with the task is accessible by the user
    const hasAccess = await verifyProjectAccess(task.projectId.toString(), req.user.id);
    if (!hasAccess) {
      res.status(403).json({ message: "You don't have access to this task" });
      return;
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error while deleting task" });
  }
};

export const reassignTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { projectId } = req.body as { projectId?: string };

    let projects: IProject[] = [];

    if (projectId) {
      const hasAccess = await verifyProjectAccess(projectId, req.user.id);
      if (!hasAccess) {
        res.status(404).json({ message: "Project not found or you don't have access to it" });
        return;
      }
      const project = await Project.findById(projectId);
      projects = project ? [project as IProject] : [];
    } else {
      const userTeams = await Team.find({ ownerId: req.user.id });
      const teamIds = userTeams.map((t) => t._id);
      projects = await Project.find({ teamId: { $in: teamIds } });
    }

    const updatedTasks: any[] = [];

    for (const project of projects) {
      const team = await Team.findOne({ _id: project.teamId, ownerId: req.user.id });
      if (!team) continue;

      const memberState = await Promise.all(
        team.members.map(async (m) => {
          const activeCount = await Task.countDocuments({
            projectId: project._id,
            assignedMemberName: m.name,
            status: { $ne: "Done" },
          });
          return {
            name: m.name,
            capacity: m.capacity,
            activeCount,
            available: Math.max(0, m.capacity - activeCount),
          };
        })
      );

      const recipients = memberState
        .filter((m) => m.available > 0)
        .sort((a, b) => b.available - a.available || a.name.localeCompare(b.name));

      for (const m of memberState.filter((x) => x.activeCount > x.capacity)) {
        let toMove = m.activeCount - m.capacity;
        if (toMove <= 0) continue;

        const candidates = await Task.find({
          projectId: project._id,
          assignedMemberName: m.name,
          status: { $ne: "Done" },
          priority: { $in: ["Low", "Medium"] },
        })
          .sort({ priority: 1, createdAt: 1 })
          .limit(toMove);

        for (const task of candidates) {
          const recipient = recipients.find((r) => r.available > 0);
          if (!recipient) break;

          const oldName = task.assignedMemberName || "";
          const newName = recipient.name;

          task.assignedMemberName = newName;
          await task.save();
          updatedTasks.push(task);

          await ActivityLog.create({
            message: `Task '${task.title}' reassigned from '${oldName}' to '${newName}'.`,
            taskId: task._id,
            fromMemberName: oldName,
            toMemberName: newName,
          });

          recipient.available -= 1;
          toMove -= 1;
          if (toMove <= 0) break;
        }
      }
    }

    res.status(200).json({
      message: "Reassignment completed",
      tasks: updatedTasks,
    });
  } catch (error) {
    console.error("Reassign tasks error:", error);
    res.status(500).json({ message: "Server error while reassigning tasks" });
  }
};

