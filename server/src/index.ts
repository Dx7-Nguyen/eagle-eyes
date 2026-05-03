import express from "express";
import cookieParser from "cookie-parser";
import { roundsRouter } from "./routes/rounds.js";
import { trendsRouter } from "./routes/trends.js";
import { authRouter } from "./routes/auth.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/rounds", roundsRouter);
app.use("/api/trends", trendsRouter);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
