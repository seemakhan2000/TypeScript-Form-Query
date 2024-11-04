import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { successResponse, errorResponse } from "./types/response";
import {
  NotFound,
  InvalidRequest,
  UserExistsError,
  UserNotFoundError,
  InvalidPasswordError,
  InvalidIDError,
  ValidationError,
} from "./errorResponse";
import { validateSignupData } from "../models/signUpValidate";
import { loginValidation } from "../models/loginValidation/loginValidation";
import { userValidation } from "../models/userValidation/userValidation";
import { updateUserValidation } from "../models/updateUserValidation/updateUserValidation";
import userModel from "../models/usermodel";
import SignupModel from "../models/signupModel";
import { BaseError } from "./errorResponse";
import { getEnvVariable } from "./env";

export class UserController {
  constructor() {
    this.signupUser = this.signupUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
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
    defaultStatusCode: number = 500
  ) {
    let message = "Internal Server Error";
    let statusCode = defaultStatusCode;

    if (error instanceof BaseError) {
      message = error.message;
      statusCode = error.statusCode;
    } else if (typeof error === "string") {
      message = error;
    } else if (error.message) {
      message = error.message;
    }

    return res.status(statusCode).json(errorResponse(message));
  }

  async signupUser(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateSignupData(req.body);
      if (error) {
        throw new InvalidRequest(
          "Validation error: " + error.details[0].message
        );
      }

      const { username, email, phone, password } = req.body;

      const existingUser = await SignupModel.findOne({ email });

      if (existingUser) {
        throw new UserExistsError();
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
      if (error instanceof UserExistsError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
      } else if (error instanceof InvalidRequest) {
        this.sendErrorResponse(res, error);
      } else {
        this.sendErrorResponse(res, "Failed to create user");
      }
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { phone, email, password } = req.body;

      const { error } = loginValidation.validate(req.body);
      if (error) {
        throw new InvalidRequest("Invalid data: " + error.details[0].message);
      }

      const user = await SignupModel.findOne({ email });

      if (!user) {
        throw new UserNotFoundError();
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new InvalidPasswordError();
      }

      const jwtSecret = getEnvVariable("JWT_SECRET");
      const token = jwt.sign({ userId: user._id, email }, jwtSecret, {
        expiresIn: "1h",
      });

      this.sendSuccessResponse(res, "Login successful", 200, { token });
    } catch (error: any) {
      if (
        error instanceof InvalidPasswordError ||
        error instanceof UserNotFoundError ||
        error instanceof InvalidRequest
      ) {
        this.sendErrorResponse(res, error);
      }

      this.sendErrorResponse(res, "Failed to login");
    }
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await userModel.find().select("-password");
      if (!result || result.length === 0) {
        throw new NotFound("User not found");
      }
      this.sendSuccessResponse(res, "Data retrieved successfully", 200, result);
    } catch (error: any) {
      if (error instanceof NotFound) {
        this.sendErrorResponse(res, error);
      } else {
        this.sendErrorResponse(res, "Failed to retrieve data");
      }
    }
  }

  async postUser(req: Request, res: Response): Promise<void> {
    const user = req.body;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      this.sendErrorResponse(
        res,
        new InvalidRequest("Unauthorized: No token provided")
      );
      return;
    }

    try {
      const { error } = userValidation.validate(user);
      if (error) {
        throw new InvalidRequest(
          "Validation error: " + error.details[0].message
        );
      }

      const existingUser = await userModel.findOne({ email: user.email });
      if (existingUser) {
        throw new UserExistsError();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      const savedUser = await userModel.create(user);

      this.sendSuccessResponse(res, "User saved successfully", 201, savedUser);
    } catch (error: any) {
      if (error instanceof InvalidRequest || error instanceof UserExistsError) {
        this.sendErrorResponse(res, error);
      } else {
        this.sendErrorResponse(res, "Failed to save user");
      }
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const updateUser = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      this.sendErrorResponse(res, new InvalidIDError());
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      this.sendErrorResponse(
        res,
        new InvalidRequest("Unauthorized: No token provided")
      );
      return;
    }

    try {
      const { error } = updateUserValidation.validate(updateUser);
      if (error) {
        throw new InvalidRequest(
          "Validation error: " + error.details[0].message
        );
      }
      const updatedUser = await userModel.findByIdAndUpdate(id, updateUser, {
        new: true,
        runValidators: true,
      });

      this.sendSuccessResponse(
        res,
        "Data updated successfully",
        200,
        updatedUser
      );
    } catch (error: any) {
      if (error instanceof ValidationError) {
        this.sendErrorResponse(res, new ValidationError(error.message));
      } else if (
        error instanceof InvalidRequest ||
        error instanceof InvalidIDError
      ) {
        this.sendErrorResponse(res, error);
      } else {
        this.sendErrorResponse(res, "Failed to update user");
      }
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
