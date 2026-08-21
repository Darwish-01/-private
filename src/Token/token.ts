const jwt = require("jsonwebtoken");
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        fullName: string;
        id: string;
        email: string;
        role: string;
      } & JwtPayload;
    }
  }
}

export function generateToken(user: any) {
    const payload = {
    fullName: user.fullName,
    id: user._id,
    email: user.email,
    role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
    });

    return token;
}