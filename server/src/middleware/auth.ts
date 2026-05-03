import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Session expired — please sign in again" });
  }
}
