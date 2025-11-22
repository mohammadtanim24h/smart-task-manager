import { Router } from "express";
import { getActivityLogs } from "../controllers/activityLogController.js";

const router = Router();

router.get("/", getActivityLogs);

export default router;
