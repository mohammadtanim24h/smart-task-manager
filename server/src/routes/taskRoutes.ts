import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  reassignTasks,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/", createTask);
router.get("/", getTasks);
router.post("/reassign", reassignTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;

