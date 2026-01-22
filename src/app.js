import express from "express";
import cors from "cors";
import router from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", router);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Application is running" });
});

export default app;
