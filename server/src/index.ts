import express from "express";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Connect Database
connectDB();

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
