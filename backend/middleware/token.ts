import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

// Define a custom request interface to include the user property
interface CustomRequest extends Request {
  user?: string | object;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  // Get the token from the Authorization header
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(500).json({ error: "No token provided" });
  }

  // Remove 'Bearer' prefix if present
  const authToken = token.replace(/bearer/gim, "").trim();

  // Verify the token using JWT
  jwt.verify(authToken, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: "Invalid token" });
    }

    // Attach the decoded token to the request object
    req.user = decoded;
    next();
  });
};
