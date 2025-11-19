import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  getProjectMembers,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id/members", getProjectMembers);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;

