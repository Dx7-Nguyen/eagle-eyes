import type { Shot, ShotWithSG, Category, HoleInput, HoleResult } from "../../../shared/types/index.js";
import { expectedStrokes, categorize } from "./baselines.js";

export const EMPTY_SG_BY_CATEGORY: Record<Category, number> = {
  TEE: 0,
  APPROACH: 0,
  SHORT_GAME: 0,
  PUTTING: 0,
};

export function shotStrokesGained(shot: Shot, holePar: number): number {
  const start = expectedStrokes(shot.startLie, shot.startDistance, holePar);
  const end = expectedStrokes(shot.endLie, shot.endDistance, holePar);
  return start - end - 1;
}

export function annotateHole(hole: HoleInput): HoleResult {
  const shots: ShotWithSG[] = hole.shots.map((shot) => ({
    ...shot,
    category: categorize(shot.startLie, shot.startDistance, hole.par),
    strokesGained: shotStrokesGained(shot, hole.par),
  }));
  const sgByCategory = { ...EMPTY_SG_BY_CATEGORY };
  for (const s of shots) sgByCategory[s.category] += s.strokesGained;
  return {
    number: hole.number,
    par: hole.par,
    strokes: shots.length,
    shots,
    sgByCategory,
  };
}

export function sumSG(parts: Record<Category, number>[]): Record<Category, number> {
  const out = { ...EMPTY_SG_BY_CATEGORY };
  for (const p of parts) {
    out.TEE += p.TEE;
    out.APPROACH += p.APPROACH;
    out.SHORT_GAME += p.SHORT_GAME;
    out.PUTTING += p.PUTTING;
  }
  return out;
}

export function sgTotal(sg: Record<Category, number>): number {
  return sg.TEE + sg.APPROACH + sg.SHORT_GAME + sg.PUTTING;
}
