import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { successResponse, errorResponse } from "./types/response";
import { NotFound, InvalidRequest } from "./errorResponse";
import { validateSignupData } from "../models/signUpValidate";
import { loginValidation } from "../models/loginValidation/loginValidation";
import { userValidation } from "../models/userValidation/userValidation";
import userModel from "../models/usermodel";
import SignupModel from "../models/signupModel";
import { getEnvVariable } from "./env";

export class UserController {
  constructor() {
    this.signupUser = this.signupUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.getUser = this.getUser.bind(this);
    this.postUser = this.postUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  private sendSuccessResponse(
    res: Response,
    message: string,
    statusCode: number,
    data?: any
  ) {
    return res.status(statusCode).json(successResponse(message, data));
  }

  private sendErrorResponse(
    res: Response,
    error: string | Error,
    statusCode: number = 500
  ) {
    const message =
      typeof error === "string"
        ? error
        : error.message || "Internal Server Error";
    return res.status(statusCode).json(errorResponse(message));
  }

  async signupUser(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, phone, password } = req.body;

      const { error, value } = validateSignupData(req.body);
      if (error) {
        this.sendErrorResponse(
          res,
          "Validation error: " + error.details[0].message,
          422
        );
      }
      const existingUser = await SignupModel.findOne({ email });

      if (existingUser) {
        this.sendErrorResponse(res, "User already exists", 409);
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new SignupModel({
        username,
        email,
        phone,
        password: hashedPassword,
      });

      await newUser.save();

      this.sendSuccessResponse(res, "Signup successful", 200, newUser);
    } catch (error: any) {
      if (error instanceof InvalidRequest) {
        this.sendErrorResponse(res, "Invalid request format", 400);
      } else {
        this.sendErrorResponse(res, "Failed to create user", 500);
      }
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { phone, email, password } = req.body;

      const { error } = loginValidation.validate(req.body);

      if (error) {
        this.sendErrorResponse(
          res,
          "Invalid data: " + error.details[0].message,
          400
        );
        return;
      }
      const user = await SignupModel.findOne({ email });

      if (!user) {
        this.sendErrorResponse(res, "User not found", 404);
        return;
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.sendErrorResponse(res, "Invalid password", 401);
        return;
      }

      const jwtSecret = getEnvVariable("JWT_SECRET");
      const token = jwt.sign({ userId: user._id, email }, jwtSecret, {
        expiresIn: "1h",
      });

      this.sendSuccessResponse(res, "Login successful", 200, { token });
    } catch (error: any) {
      if (error instanceof InvalidRequest) {
        this.sendErrorResponse(res, error.message, 422);
      } else {
        this.sendErrorResponse(res, "Failed to login", 500);
      }
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await userModel.find().select("-password");
      this.sendSuccessResponse(res, "Data retrieved successfully", 200, result);
    } catch (error: any) {
      if (error instanceof NotFound) {
        this.sendErrorResponse(res, error.message, 404);
      } else {
        this.sendErrorResponse(res, "Failed to retrieve data", 500);
      }
    }
  }

  async postUser(req: Request, res: Response): Promise<void> {
    const user = req.body;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      this.sendErrorResponse(res, "Unauthorized: No token provided", 401);
      return;
    }
    try {
      const { error } = userValidation.validate(user);

      if (error) {
        this.sendErrorResponse(
          res,
          "Validation error: " + error.details[0].message,
          422
        );
        return;
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      const savedUser = await userModel.create(user);

      this.sendSuccessResponse(res, "User saved successfully", 201, savedUser);
    } catch (error: any) {
      this.sendErrorResponse(res, "Failed to save user", 500);
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const updateUser = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      this.sendErrorResponse(res, "Invalid User ID", 400);
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      this.sendErrorResponse(res, "Unauthorized: No token provided");
      return;
    }

    try {
      const updatedUser = await userModel.findByIdAndUpdate(id, updateUser, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        this.sendErrorResponse(res, "User not found", 404);
        return;
      }
      this.sendSuccessResponse(
        res,
        "Data updated successfully",
        200,
        updatedUser
      );
    } catch (error: any) {
      this.sendErrorResponse(res, "Failed to update user", 500);
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id || !mongoose.isValidObjectId(id)) {
      this.sendErrorResponse(res, "Invalid User ID", 400);
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      this.sendErrorResponse(res, "Unauthorized: No token provided");
      return;
    }

    try {
      const deletedUser = await userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        this.sendErrorResponse(res, "User not found", 404);
      }

      this.sendSuccessResponse(
        res,
        "Data deleted successfully",
        200,
        deletedUser
      );
    } catch (error: any) {
      this.sendErrorResponse(res, "Failed to delete user", 500);
    }
  }
}

export const userControllers = new UserController();
