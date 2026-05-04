import { Router } from "express";
import type {
  RoundInput,
  RoundDetail,
  RoundSummary,
  DraftSummary,
  RoundEditData,
  Lie,
  EndLie,
} from "../../../shared/types/index.js";
import { prisma } from "../lib/prisma.js";
import { annotateHole, sumSG, sgTotal } from "../lib/strokes-gained.js";
import { requireAuth } from "../middleware/auth.js";

export const roundsRouter = Router();

roundsRouter.use(requireAuth);

const VALID_START_LIES: Lie[] = ["TEE", "FAIRWAY", "ROUGH", "SAND", "RECOVERY", "GREEN"];
const VALID_END_LIES: EndLie[] = [...VALID_START_LIES, "HOLE"];

function normalizeExternalId(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function normalizeRating(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSlope(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function normalizeTeeName(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

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

function validateDraft(input: RoundInput): string | null {
  if (!input.course?.trim()) return "course is required";
  for (const h of input.holes ?? []) {
    if (!Number.isInteger(h.number) || h.number < 1 || h.number > 18) return `hole ${h.number}: invalid number`;
    if (!Number.isInteger(h.par) || h.par < 3 || h.par > 6) return `hole ${h.number}: invalid par`;
    for (const s of h.shots ?? []) {
      if (!VALID_START_LIES.includes(s.startLie)) return `hole ${h.number} shot ${s.shotNumber}: bad startLie`;
      if (!VALID_END_LIES.includes(s.endLie)) return `hole ${h.number} shot ${s.shotNumber}: bad endLie`;
      if (!(s.startDistance >= 0)) return `hole ${h.number} shot ${s.shotNumber}: bad startDistance`;
      if (!(s.endDistance >= 0)) return `hole ${h.number} shot ${s.shotNumber}: bad endDistance`;
    }
  }
  return null;
}

// ── GET /drafts — list draft rounds ─────────────────────────────────────────
roundsRouter.get("/drafts", async (req, res) => {
  const userId = req.user!.userId;
  const rounds = await prisma.round.findMany({
    where: { status: "DRAFT", userId },
    orderBy: { createdAt: "desc" },
    include: { holes: true },
  });
  const summaries: DraftSummary[] = rounds.map((r) => ({
    id: r.id,
    course: r.course,
    date: r.date.toISOString(),
    holeCount: r.holes.length,
  }));
  res.json(summaries);
});

// ── POST /draft — create a new draft ────────────────────────────────────────
roundsRouter.post("/draft", async (req, res) => {
  const userId = req.user!.userId;
  const input = req.body as RoundInput;
  const err = validateDraft(input);
  if (err) { res.status(400).json({ error: err }); return; }

  const created = await prisma.round.create({
    data: {
      course: input.course.trim(),
      courseExternalId: normalizeExternalId(input.courseExternalId),
      courseRating: normalizeRating(input.courseRating),
      slopeRating: normalizeSlope(input.slopeRating),
      teeName: normalizeTeeName(input.teeName),
      date: input.date ? new Date(input.date) : new Date(),
      status: "DRAFT",
      userId,
      holes: {
        create: (input.holes ?? []).map((h) => ({
          number: h.number,
          par: h.par,
          shots: { create: h.shots.map(shotData) },
        })),
      },
    },
    include: { holes: true },
  });

  const summary: DraftSummary = {
    id: created.id,
    course: created.course,
    date: created.date.toISOString(),
    holeCount: created.holes.length,
  };
  res.status(201).json(summary);
});

// ── GET / — list published rounds ────────────────────────────────────────────
roundsRouter.get("/", async (req, res) => {
  const userId = req.user!.userId;
  const rounds = await prisma.round.findMany({
    where: { status: "PUBLISHED", userId },
    orderBy: { date: "desc" },
    include: { holes: { include: { shots: true } } },
  });
  const summaries: RoundSummary[] = rounds.map(buildSummary);
  res.json(summaries);
});

// ── POST / — create published round ─────────────────────────────────────────
roundsRouter.post("/", async (req, res) => {
  const userId = req.user!.userId;
  const input = req.body as RoundInput;
  const err = validate(input);
  if (err) { res.status(400).json({ error: err }); return; }

  const created = await prisma.round.create({
    data: {
      course: input.course.trim(),
      courseExternalId: normalizeExternalId(input.courseExternalId),
      courseRating: normalizeRating(input.courseRating),
      slopeRating: normalizeSlope(input.slopeRating),
      teeName: normalizeTeeName(input.teeName),
      date: input.date ? new Date(input.date) : new Date(),
      status: "PUBLISHED",
      userId,
      holes: {
        create: input.holes.map((h) => ({
          number: h.number,
          par: h.par,
          shots: { create: h.shots.map(shotData) },
        })),
      },
    },
    include: { holes: { include: { shots: true } } },
  });

  res.status(201).json(buildDetail(created));
});

// ── DELETE /:id ──────────────────────────────────────────────────────────────
roundsRouter.delete("/:id", async (req, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }
  const round = await prisma.round.findUnique({ where: { id } });
  if (!round || round.userId !== userId) { res.status(404).json({ error: "not found" }); return; }
  await prisma.round.delete({ where: { id } });
  res.status(204).end();
});

// ── GET /:id/edit — raw editable data for any round ──────────────────────────
roundsRouter.get("/:id/edit", async (req, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }
  const round = await prisma.round.findUnique({
    where: { id },
    include: { holes: { include: { shots: true } } },
  });
  if (!round || round.userId !== userId) { res.status(404).json({ error: "not found" }); return; }

  const editData: RoundEditData = {
    id: round.id,
    course: round.course,
    courseExternalId: round.courseExternalId,
    courseRating: round.courseRating,
    slopeRating: round.slopeRating,
    teeName: round.teeName,
    date: round.date.toISOString(),
    status: round.status as "DRAFT" | "PUBLISHED",
    holes: round.holes
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
      })),
  };
  res.json(editData);
});

// ── PUT /:id — replace holes on a draft ─────────────────────────────────────
roundsRouter.put("/:id", async (req, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }

  const round = await prisma.round.findUnique({ where: { id } });
  if (!round || round.userId !== userId) { res.status(404).json({ error: "not found" }); return; }
  if (round.status !== "DRAFT") { res.status(400).json({ error: "can only update draft rounds" }); return; }

  const input = req.body as RoundInput;
  const err = validateDraft(input);
  if (err) { res.status(400).json({ error: err }); return; }

  await prisma.$transaction(async (tx) => {
    await tx.hole.deleteMany({ where: { roundId: id } });
    await tx.round.update({
      where: { id },
      data: {
        course: input.course.trim(),
        courseExternalId: normalizeExternalId(input.courseExternalId),
        courseRating: normalizeRating(input.courseRating),
        slopeRating: normalizeSlope(input.slopeRating),
        teeName: normalizeTeeName(input.teeName),
        date: input.date ? new Date(input.date) : round.date,
        holes: {
          create: (input.holes ?? []).map((h) => ({
            number: h.number,
            par: h.par,
            shots: { create: h.shots.map(shotData) },
          })),
        },
      },
    });
  });

  res.status(204).end();
});

// ── POST /:id/publish — validate and publish a draft ────────────────────────
roundsRouter.post("/:id/publish", async (req, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }

  const round = await prisma.round.findUnique({
    where: { id },
    include: { holes: { include: { shots: true } } },
  });
  if (!round || round.userId !== userId) { res.status(404).json({ error: "not found" }); return; }
  if (round.status !== "DRAFT") { res.status(400).json({ error: "round is already published" }); return; }

  const asInput: RoundInput = {
    course: round.course,
    date: round.date.toISOString(),
    holes: round.holes
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
      })),
  };
  const err = validate(asInput);
  if (err) { res.status(400).json({ error: err }); return; }

  await prisma.round.update({ where: { id }, data: { status: "PUBLISHED" } });

  const published = await prisma.round.findUniqueOrThrow({
    where: { id },
    include: { holes: { include: { shots: true } } },
  });
  res.json(buildDetail(published));
});

// ── GET /:id ─────────────────────────────────────────────────────────────────
roundsRouter.get("/:id", async (req, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) { res.status(400).json({ error: "invalid id" }); return; }
  const round = await prisma.round.findUnique({
    where: { id },
    include: { holes: { include: { shots: true } } },
  });
  if (!round || round.userId !== userId) { res.status(404).json({ error: "not found" }); return; }
  res.json(buildDetail(round));
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function shotData(s: { shotNumber: number; startLie: string; startDistance: number; endLie: string; endDistance: number }) {
  return {
    shotNumber: s.shotNumber,
    startLie: s.startLie,
    startDistance: s.startDistance,
    endLie: s.endLie,
    endDistance: s.endDistance,
  };
}

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
