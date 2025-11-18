import { Router } from "express";
import { createTeam, deleteTeam, getTeams, updateTeam } from "../controllers/teamController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/", createTeam);
router.get("/", getTeams);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;


