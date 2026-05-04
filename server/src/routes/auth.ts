import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^[a-zA-Z0-9]{8,128}$/;

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function userResponse(user: { id: number; email: string; firstName: string; gender: string }) {
  return { id: user.id, email: user.email, firstName: user.firstName, gender: user.gender };
}

authRouter.post("/register", async (req, res) => {
  const { email, password, firstName } = req.body as {
    email?: string;
    password?: string;
    firstName?: string;
  };

  const name = firstName?.trim() ?? "";
  if (!name) {
    res.status(400).json({ error: "Full name is required" });
    return;
  }
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }
  if (!password || !PASSWORD_RE.test(password)) {
    res.status(400).json({ error: "Password must be 8–128 characters and contain only letters and numbers" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), password: hashed, firstName: name },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.cookie("token", token, COOKIE_OPTS);
  res.status(201).json(userResponse(user));
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.cookie("token", token, COOKIE_OPTS);
  res.json(userResponse(user));
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) { res.status(401).json({ error: "User not found" }); return; }
  res.json(userResponse(user));
});

authRouter.patch("/profile", requireAuth, async (req, res) => {
  const { firstName, gender } = req.body as { firstName?: string; gender?: string };

  const data: { firstName?: string; gender?: string } = {};

  if (firstName !== undefined) {
    const name = firstName.trim();
    if (!name) { res.status(400).json({ error: "Full name cannot be empty" }); return; }
    data.firstName = name;
  }

  if (gender !== undefined) {
    if (!["male", "female", ""].includes(gender)) {
      res.status(400).json({ error: "Invalid gender value" }); return;
    }
    data.gender = gender;
  }

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data,
  });
  res.json(userResponse(user));
});
