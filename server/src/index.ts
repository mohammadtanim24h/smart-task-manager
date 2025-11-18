import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import teamRoutes from "./routes/teamRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
// CORS
app.use(cors());

// Connect Database
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

// Auth routes
app.use("/api/auth", authRoutes);

// Team routes (protected)
app.use("/api/teams", teamRoutes);

// Project routes (protected)
app.use("/api/projects", projectRoutes);

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
