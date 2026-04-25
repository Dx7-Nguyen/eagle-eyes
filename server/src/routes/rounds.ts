import { Router } from "express";
import type {
  RoundInput,
  RoundDetail,
  RoundSummary,
  Lie,
  EndLie,
} from "../../../shared/types/index.js";
import { prisma } from "../lib/prisma.js";
import { annotateHole, sumSG, sgTotal } from "../lib/strokes-gained.js";

export const roundsRouter = Router();

const VALID_START_LIES: Lie[] = ["TEE", "FAIRWAY", "ROUGH", "SAND", "RECOVERY", "GREEN"];
const VALID_END_LIES: EndLie[] = [...VALID_START_LIES, "HOLE"];

function validate(input: RoundInput): string | null {
  if (!input.course?.trim()) return "course is required";
  if (!Array.isArray(input.holes) || input.holes.length === 0) return "holes are required";
  for (const h of input.holes) {
    if (!Number.isInteger(h.number) || h.number < 1 || h.number > 18) return `hole ${h.number}: invalid number`;
    if (!Number.isInteger(h.par) || h.par < 3 || h.par > 6) return `hole ${h.number}: invalid par`;
    if (!Array.isArray(h.shots) || h.shots.length === 0) return `hole ${h.number}: shots required`;
    for (const s of h.shots) {
      if (!VALID_START_LIES.includes(s.startLie)) return `hole ${h.number} shot ${s.shotNumber}: bad startLie`;
      if (!VALID_END_LIES.includes(s.endLie)) return `hole ${h.number} shot ${s.shotNumber}: bad endLie`;
      if (!(s.startDistance >= 0)) return `hole ${h.number} shot ${s.shotNumber}: bad startDistance`;
      if (!(s.endDistance >= 0)) return `hole ${h.number} shot ${s.shotNumber}: bad endDistance`;
    }
    const last = h.shots[h.shots.length - 1];
    if (last.endLie !== "HOLE") return `hole ${h.number}: last shot must end in HOLE`;
  }
  return null;
}

roundsRouter.post("/", async (req, res) => {
  const input = req.body as RoundInput;
  const err = validate(input);
  if (err) return res.status(400).json({ error: err });

  const created = await prisma.round.create({
    data: {
      course: input.course.trim(),
      date: input.date ? new Date(input.date) : new Date(),
      holes: {
        create: input.holes.map((h) => ({
          number: h.number,
          par: h.par,
          shots: {
            create: h.shots.map((s) => ({
              shotNumber: s.shotNumber,
              startLie: s.startLie,
              startDistance: s.startDistance,
              endLie: s.endLie,
              endDistance: s.endDistance,
            })),
          },
        })),
      },
    },
    include: { holes: { include: { shots: true } } },
  });

  res.status(201).json(buildDetail(created));
});

roundsRouter.get("/", async (_req, res) => {
  const rounds = await prisma.round.findMany({
    orderBy: { date: "desc" },
    include: { holes: { include: { shots: true } } },
  });
  const summaries: RoundSummary[] = rounds.map(buildSummary);
  res.json(summaries);
});

roundsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid id" });
  const round = await prisma.round.findUnique({ where: { id } });
  if (!round) return res.status(404).json({ error: "not found" });
  await prisma.round.delete({ where: { id } });
  res.status(204).end();
});

roundsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid id" });
  const round = await prisma.round.findUnique({
    where: { id },
    include: { holes: { include: { shots: true } } },
  });
  if (!round) return res.status(404).json({ error: "not found" });
  res.json(buildDetail(round));
});

type DbRound = Awaited<ReturnType<typeof prisma.round.findUniqueOrThrow>> & {
  holes: Array<{
    id: number;
    number: number;
    par: number;
    shots: Array<{
      shotNumber: number;
      startLie: string;
      startDistance: number;
      endLie: string;
      endDistance: number;
    }>;
  }>;
};

function buildDetail(round: DbRound): RoundDetail {
  const holes = round.holes
    .sort((a, b) => a.number - b.number)
    .map((h) =>
      annotateHole({
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
      }),
    );
  const sgByCategory = sumSG(holes.map((h) => h.sgByCategory));
  return {
    id: round.id,
    course: round.course,
    date: round.date.toISOString(),
    totalStrokes: holes.reduce((sum, h) => sum + h.strokes, 0),
    totalPar: holes.reduce((sum, h) => sum + h.par, 0),
    sgByCategory,
    sgTotal: sgTotal(sgByCategory),
    holes,
  };
}

function buildSummary(round: DbRound): RoundSummary {
  const detail = buildDetail(round);
  const { holes: _holes, ...summary } = detail;
  return summary;
}
