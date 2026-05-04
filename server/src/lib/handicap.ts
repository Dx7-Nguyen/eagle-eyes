import type { HoleInput } from "../../../shared/types/index.js";

export function adjustedGrossScore(holes: HoleInput[]): number {
  return holes.reduce((sum, h) => sum + Math.min(h.shots.length, h.par + 5), 0);
}

export function differential(ags: number, courseRating: number, slopeRating: number): number {
  const raw = (113 / slopeRating) * (ags - courseRating);
  return Math.round(raw * 10) / 10;
}

interface WhsRow { used: number; adjustment: number; }

function whsRow(rounds: number): WhsRow | null {
  if (rounds < 3) return null;
  if (rounds === 3) return { used: 1, adjustment: -2.0 };
  if (rounds === 4) return { used: 1, adjustment: -1.0 };
  if (rounds === 5) return { used: 1, adjustment: 0 };
  if (rounds === 6) return { used: 2, adjustment: -1.0 };
  if (rounds <= 8) return { used: 2, adjustment: 0 };
  if (rounds <= 11) return { used: 3, adjustment: 0 };
  if (rounds <= 14) return { used: 4, adjustment: 0 };
  if (rounds <= 16) return { used: 5, adjustment: 0 };
  if (rounds <= 18) return { used: 6, adjustment: 0 };
  if (rounds === 19) return { used: 7, adjustment: 0 };
  return { used: 8, adjustment: 0 };
}

export function handicapIndex(diffs: number[]): { index: number | null; usedCount: number } {
  const row = whsRow(diffs.length);
  if (!row) return { index: null, usedCount: 0 };
  const sorted = [...diffs].sort((a, b) => a - b);
  const lowest = sorted.slice(0, row.used);
  const avg = lowest.reduce((s, d) => s + d, 0) / lowest.length;
  const index = Math.round((avg + row.adjustment) * 10) / 10;
  return { index, usedCount: row.used };
}
