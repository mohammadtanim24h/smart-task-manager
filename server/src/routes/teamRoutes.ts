import { Router } from "express";
import {
  addMember,
  createTeam,
  deleteMember,
  deleteTeam,
  getTeams,
  updateMember,
  updateTeam,
} from "../controllers/teamController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/", createTeam);
router.get("/", getTeams);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

// Member management routes
router.post("/:teamId/members", addMember);
router.put("/:teamId/members/:memberIndex", updateMember);
router.delete("/:teamId/members/:memberIndex", deleteMember);

export default router;


