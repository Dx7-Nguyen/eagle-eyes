import { Router } from "express";
import type { TrendPoint, Lie, EndLie } from "../../../shared/types/index.js";
import { prisma } from "../lib/prisma.js";
import { annotateHole, sumSG, sgTotal } from "../lib/strokes-gained.js";
import { requireAuth } from "../middleware/auth.js";

export const trendsRouter = Router();

trendsRouter.use(requireAuth);

trendsRouter.get("/", async (req, res) => {
  const userId = req.user!.userId;
  const rounds = await prisma.round.findMany({
    where: { status: "PUBLISHED", userId },
    orderBy: { date: "asc" },
    include: { holes: { include: { shots: true } } },
  });

  const points: TrendPoint[] = rounds.map((round) => {
    const holes = round.holes.map((h) =>
      annotateHole({
        number: h.number,
        par: h.par,
        shots: h.shots.map((s) => ({
          shotNumber: s.shotNumber,
          startLie: s.startLie as Lie,
          startDistance: s.startDistance,
          endLie: s.endLie as EndLie,
          endDistance: s.endDistance,
        })),
      }),
    );
    const sgByCategory = sumSG(holes.map((h) => h.sgByCategory));
    return {
      roundId: round.id,
      date: round.date.toISOString(),
      sgByCategory,
      sgTotal: sgTotal(sgByCategory),
    };
  });

  res.json(points);
});
