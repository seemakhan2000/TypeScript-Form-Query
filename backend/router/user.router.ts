import { Router } from "express";

import { userControllers } from "../controller/user.controller";

import { verifyToken } from "../middleware/token";
const userRouter = Router();

userRouter.get("/get", userControllers.getUsers);
userRouter.post("/", verifyToken, userControllers.postUser);
userRouter.delete("/delete/:id", verifyToken, userControllers.deleteUser);
userRouter.put("/update/:id", verifyToken, userControllers.updateUser);

userRouter.post("/login", userControllers.loginUser);
userRouter.post("/signup", userControllers.signupUser);

export default userRouter;
