import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import userRouter from "./router/user.router";
import connectDB from "./connectMongoDB/db";

const app = express();
const port = process.env.PORT || 7007;

app.use(cors());

app.use(express.json());

app.use("/user", userRouter);

connectDB();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
