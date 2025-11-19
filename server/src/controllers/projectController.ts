import { type Request, type Response } from "express";
import { Project } from "../models/Project.js";
import { Team } from "../models/Team.js";
import { Task } from "../models/Task.js";

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, teamId } = req.body;

    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    if (!title) {
      res.status(400).json({ message: "Project title is required" });
      return;
    }

    if (!description) {
      res.status(400).json({ message: "Project description is required" });
      return;
    }

    if (!teamId) {
      res.status(400).json({ message: "Team ID is required" });
      return;
    }

    // Verify that the team exists and is owned by the user
    const team = await Team.findOne({ _id: teamId, ownerId: req.user.id });

    if (!team) {
      res.status(404).json({ message: "Team not found or you don't have access to it" });
      return;
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      teamId,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error: any) {
    console.error("Create project error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(", ") });
      return;
    }
    res.status(500).json({ message: "Server error while creating project" });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { teamId } = req.query;

    // Get all teams owned by the user
    const userTeams = await Team.find({ ownerId: req.user.id });
    const teamIds = userTeams.map((team) => team._id);

    let query: any = { teamId: { $in: teamIds } };

    // If teamId is provided, filter by that team (and verify ownership)
    if (teamId) {
      const team = userTeams.find((t) => t._id.toString() === teamId);
      if (!team) {
        res.status(404).json({ message: "Team not found or you don't have access to it" });
        return;
      }
      query.teamId = team._id;
    }

    const projects = await Project.find(query)
      .populate("teamId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { id } = req.params;
    const { title, description, teamId } = req.body;

    // Find the project
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Verify that the team associated with the project is owned by the user
    const team = await Team.findOne({ _id: project.teamId, ownerId: req.user.id });

    if (!team) {
      res.status(403).json({ message: "You don't have access to this project" });
      return;
    }

    // If teamId is being updated, verify the new team exists and is owned by the user
    if (teamId && teamId !== project.teamId.toString()) {
      const newTeam = await Team.findOne({ _id: teamId, ownerId: req.user.id });
      if (!newTeam) {
        res.status(404).json({ message: "New team not found or you don't have access to it" });
        return;
      }
      project.teamId = teamId as any;
    }

    if (typeof title === "string" && title.trim().length > 0) {
      project.title = title.trim();
    }

    if (typeof description === "string" && description.trim().length > 0) {
      project.description = description.trim();
    }

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error: any) {
    console.error("Update project error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(", ") });
      return;
    }
    res.status(500).json({ message: "Server error while updating project" });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { id } = req.params;

    // Find the project
    const project = await Project.findById(id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Verify that the team associated with the project is owned by the user
    const team = await Team.findOne({ _id: project.teamId, ownerId: req.user.id });

    if (!team) {
      res.status(403).json({ message: "You don't have access to this project" });
      return;
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error while deleting project" });
  }
};

export const getProjectMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const team = await Team.findOne({ _id: project.teamId, ownerId: req.user.id });
    if (!team) {
      res.status(403).json({ message: "You don't have access to this project" });
      return;
    }

    const members = await Promise.all(
      team.members.map(async (m) => {
        const currentTasks = await Task.countDocuments({
          projectId: project._id,
          assignedMemberName: m.name,
        });
        return {
          name: m.name,
          role: m.role,
          capacity: m.capacity,
          currentTasks,
        };
      })
    );

    res.status(200).json({ members });
  } catch (error) {
    console.error("Get project members error:", error);
    res.status(500).json({ message: "Server error while fetching project members" });
  }
};

