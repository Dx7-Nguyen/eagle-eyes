import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { roundsRouter } from "./routes/rounds.js";
import { trendsRouter } from "./routes/trends.js";
import { authRouter } from "./routes/auth.js";
import { coursesRouter } from "./routes/courses.js";
import { handicapRouter } from "./routes/handicap.js";

const app = express();

const allowedOrigin = process.env.CLIENT_URL ?? "http://localhost:5173";
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/rounds", roundsRouter);
app.use("/api/trends", trendsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/handicap", handicapRouter);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
