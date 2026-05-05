import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set in production");
}
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const SALT_ROUNDS = 12;

export interface JwtPayload {
  userId: number;
  email: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload, expiresIn: SignOptions["expiresIn"] = "1d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
