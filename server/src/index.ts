import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import teamRoutes from "./routes/teamRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Middleware
app.use(express.json());
// CORS

// Connect Database
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

// Auth routes
app.use("/api/auth", protect, authRoutes);

// Team routes (protected)
app.use("/api/teams", protect, teamRoutes);

// Project routes (protected)
app.use("/api/projects", protect, projectRoutes);

// Task routes (protected)
app.use("/api/tasks", protect, taskRoutes);

// Dashboard routes (protected)
app.use("/api/dashboard", protect, dashboardRoutes);

// Protected route example
app.get("/api/me", protect, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
