import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import router from "./routes/userRoutes.js";

const app = express();
mongoose.connect(
  "mongodb+srv://admin:JgGeEEzS1xeBhfEb@cluster0.zpsb0jr.mongodb.net/fundooDB"
);

app.use(express.json());
app.use("/", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
