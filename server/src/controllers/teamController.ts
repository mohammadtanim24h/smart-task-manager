import { type Request, type Response } from "express";
import { Team } from "../models/Team.js";

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, members } = req.body;

    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    if (!name) {
      res.status(400).json({ message: "Team name is required" });
      return;
    }

    const team = await Team.create({
      name,
      members: members ?? [],
      ownerId: req.user.id,
    });

    res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error: any) {
    console.error("Create team error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(", ") });
      return;
    }
    res.status(500).json({ message: "Server error while creating team" });
  }
};

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const teams = await Team.find({ ownerId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({ teams });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ message: "Server error while fetching teams" });
  }
};

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { id } = req.params;
    const { name, members } = req.body;

    const team = await Team.findOne({ _id: id, ownerId: req.user.id });

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    if (typeof name === "string" && name.trim().length > 0) {
      team.name = name.trim();
    }

    if (Array.isArray(members)) {
      team.members = members;
    }

    await team.save();

    res.status(200).json({
      message: "Team updated successfully",
      team,
    });
  } catch (error: any) {
    console.error("Update team error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(", ") });
      return;
    }
    res.status(500).json({ message: "Server error while updating team" });
  }
};

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { id } = req.params;

    const team = await Team.findOneAndDelete({ _id: id, ownerId: req.user.id });

    if (!team) {
      res.status(404).json({ message: "Team not found" });
      return;
    }

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Delete team error:", error);
    res.status(500).json({ message: "Server error while deleting team" });
  }
};


