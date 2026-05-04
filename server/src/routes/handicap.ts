import { Router } from "express";
import type { HandicapData, Lie, EndLie } from "../../../shared/types/index.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { adjustedGrossScore, differential, handicapIndex } from "../lib/handicap.js";

export const handicapRouter = Router();

handicapRouter.use(requireAuth);

handicapRouter.get("/", async (req, res) => {
  const userId = req.user!.userId;

  const rounds = await prisma.round.findMany({
    where: {
      userId,
      status: "PUBLISHED",
      courseRating: { not: null },
      slopeRating: { not: null },
    },
    orderBy: { date: "desc" },
    include: { holes: { include: { shots: true } } },
  });

  const eligible = rounds
    .filter((r) => r.holes.length === 18)
    .slice(0, 20);

  const records = eligible.map((r) => {
    const holes = r.holes
      .sort((a, b) => a.number - b.number)
      .map((h) => ({
        number: h.number,
        par: h.par,
        shots: h.shots
          .sort((a, b) => a.shotNumber - b.shotNumber)
          .map((s) => ({
            shotNumber: s.shotNumber,
            startLie: s.startLie as Lie,
            startDistance: s.startDistance,
            endLie: s.endLie as EndLie,
            endDistance: s.endDistance,
          })),
      }));
    const ags = adjustedGrossScore(holes);
    const diff = differential(ags, r.courseRating!, r.slopeRating!);
    return { roundId: r.id, date: r.date.toISOString(), course: r.course, differential: diff };
  });

  const diffs = records.map((r) => r.differential);
  const { index, usedCount } = handicapIndex(diffs);

  // Mark which differentials were "used" (the lowest `usedCount`).
  const sortedAsc = [...records].sort((a, b) => a.differential - b.differential);
  const usedRoundIds = new Set(sortedAsc.slice(0, usedCount).map((r) => r.roundId));

  const response: HandicapData = {
    handicapIndex: index,
    usedCount,
    eligibleCount: eligible.length,
    minRequired: 3,
    differentials: records.map((r) => ({ ...r, used: usedRoundIds.has(r.roundId) })),
  };
  res.json(response);
});
