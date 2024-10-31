import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { successResponse, errorResponse } from "./types/response";
import {
  NotFound,
  ValidationError,
  InvalidRequest,
  UnexpectedError,
} from "./errorResponse";
import { validateSignupData } from "../models/signUpValidate";
import { loginValidation } from "../models/loginValidation/loginValidation";
import ReactModel from "../models/schema";
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

  private sendErrorResponse(res: Response, error: string | Error) {
    const message =
      typeof error === "string"
        ? error
        : error.message || "Internal Server Error";
    const status =
      error instanceof NotFound
        ? 404
        : error instanceof ValidationError || error instanceof InvalidRequest
        ? 422
        : error instanceof UnexpectedError
        ? 500
        : 500;
    return res.status(status).json(errorResponse(message));
  }

  async signupUser(req: Request, res: Response): Promise<void> {
    const { username, email, phone, password } = req.body;

    const { error, value } = validateSignupData(req.body);

    if (error) {
      this.sendErrorResponse(res, "Invalid signup data");
      return;
    }

    try {
      const existingUser = await SignupModel.findOne({ email });

      if (existingUser) {
        this.sendErrorResponse(res, "User already exists");
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
      if (
        error instanceof ValidationError ||
        error instanceof NotFound ||
        error instanceof InvalidRequest
      ) {
        console.log(`${error.statusCode} Status Code: ${error.message}`);
      } else {
        console.error("Signup error:", error);
      }
      this.sendErrorResponse(res, "Failed to create user");
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { phone, email, password } = req.body;

      const { error } = loginValidation.validate(req.body);

      if (error) {
        this.sendErrorResponse(
          res,
          "Invalid data: " + error.details[0].message
        );
        return;
      }
      const user = await SignupModel.findOne({ email });

      if (!user) {
        this.sendErrorResponse(res, "User not found");
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.sendErrorResponse(res, "Invalid password");
        return;
      }

      const jwtSecret = getEnvVariable("JWT_SECRET");
      const token = jwt.sign({ userId: user._id, email }, jwtSecret, {
        expiresIn: "1h",
      });

      this.sendSuccessResponse(res, "Login successful", 200, { token });
    } catch (error: any) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFound ||
        error instanceof InvalidRequest
      ) {
        console.log(`${error.statusCode} Status Code: ${error.message}`);
      } else {
        console.error("Login error:", error);
      }
      this.sendErrorResponse(res, "Failed to login");
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await ReactModel.find();
      this.sendSuccessResponse(res, "Data retrieved successfully", 200, result);
    } catch (error: any) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFound ||
        error instanceof InvalidRequest
      ) {
        console.log(`${error.statusCode} Status Code: ${error.message}`);
      } else {
        console.error("Get user error:", error);
      }
      this.sendErrorResponse(res, "Failed to retrieve data");
    }
  }
  async postUser(req: Request, res: Response): Promise<void> {
    const user = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      this.sendErrorResponse(res, "Unauthorized: No token provided");
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      const savedUser = await ReactModel.create(user);
      this.sendSuccessResponse(res, "User saved successfully", 201, savedUser);
    } catch (error: any) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFound ||
        error instanceof InvalidRequest
      ) {
        console.log(`${error.statusCode} Status Code: ${error.message}`);
      } else {
        console.error("Post user error:", error);
      }
      this.sendErrorResponse(res, "Failed to save user");
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const updateUser = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      this.sendErrorResponse(res, "Invalid User ID");
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      this.sendErrorResponse(res, "Unauthorized: No token provided");
      return;
    }

    try {
      const updatedUser = await ReactModel.findByIdAndUpdate(id, updateUser, {
        new: true,
      });

      if (!updatedUser) {
        this.sendErrorResponse(res, "User not found");
        return;
      }
      this.sendSuccessResponse(
        res,
        "Data updated successfully",
        200,
        updatedUser
      );
    } catch (error: any) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFound ||
        error instanceof InvalidRequest
      ) {
        console.log(`${error.statusCode} Status Code: ${error.message}`);
      } else {
        console.error("Update user error:", error);
      }
      this.sendErrorResponse(res, "Failed to update user");
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id || !mongoose.isValidObjectId(id)) {
      this.sendErrorResponse(res, "Invalid User ID");
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      this.sendErrorResponse(res, "Unauthorized: No token provided");
      return;
    }

    try {
      const deletedUser = await ReactModel.findByIdAndDelete(id);
      this.sendSuccessResponse(
        res,
        "Data deleted successfully",
        200,
        deletedUser
      );
    } catch (error: any) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFound ||
        error instanceof InvalidRequest
      ) {
        console.log(`${error.statusCode} Status Code: ${error.message}`);
      } else {
        console.error("Delete user error:", error);
      }
      this.sendErrorResponse(res, "Failed to delete user");
    }
  }
}

export const userControllers = new UserController();
