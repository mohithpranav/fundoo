import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import router from "./routes/userRoutes.js";

const app = express();
mongoose.connect(process.env.MONGODB_URI);

app.use(express.json());
app.use("/", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
