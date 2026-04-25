import type { Lie, EndLie, Category } from "../../../shared/types/index.js";

type Table = ReadonlyArray<readonly [number, number]>;

const TEE_PAR4PLUS: Table = [
  [600, 4.83], [550, 4.66], [500, 4.50], [450, 4.34],
  [400, 4.17], [350, 4.04], [300, 3.84], [250, 3.71], [200, 3.55],
];

const FAIRWAY: Table = [
  [250, 3.61], [200, 3.32], [175, 3.15], [150, 2.98], [125, 2.89],
  [100, 2.80], [75, 2.71], [50, 2.67], [30, 2.59], [20, 2.51], [10, 2.31],
];

const ROUGH: Table = [
  [250, 3.84], [200, 3.59], [175, 3.41], [150, 3.23], [125, 3.12],
  [100, 3.02], [75, 2.97], [50, 2.92], [30, 2.74], [20, 2.65], [10, 2.46],
];

const SAND: Table = [
  [250, 4.13], [200, 3.85], [175, 3.69], [150, 3.52], [125, 3.40],
  [100, 3.27], [75, 3.12], [50, 2.97], [30, 2.79], [20, 2.70], [10, 2.51],
];

const RECOVERY: Table = [
  [250, 4.27], [200, 3.99], [175, 3.81], [150, 3.66], [125, 3.51],
  [100, 3.41], [75, 3.20], [50, 3.05], [30, 2.86], [20, 2.74], [10, 2.55],
];

const GREEN_FT: Table = [
  [90, 2.34], [60, 2.21], [50, 2.17], [40, 2.10], [30, 2.02],
  [20, 1.87], [15, 1.78], [10, 1.61], [7, 1.44], [5, 1.23],
  [4, 1.13], [3, 1.04], [2, 1.01], [1, 1.00],
];

function interpolate(table: Table, distance: number): number {
  if (distance <= 0) return 0;
  const sorted = [...table].sort((a, b) => a[0] - b[0]);
  if (distance <= sorted[0][0]) return sorted[0][1];
  if (distance >= sorted[sorted.length - 1][0]) return sorted[sorted.length - 1][1];
  for (let i = 0; i < sorted.length - 1; i++) {
    const [d1, e1] = sorted[i];
    const [d2, e2] = sorted[i + 1];
    if (distance >= d1 && distance <= d2) {
      const t = (distance - d1) / (d2 - d1);
      return e1 + t * (e2 - e1);
    }
  }
  return sorted[sorted.length - 1][1];
}

export function expectedStrokes(
  lie: EndLie,
  distance: number,
  holePar: number,
): number {
  if (lie === "HOLE" || distance === 0) return 0;
  switch (lie) {
    case "TEE":
      return holePar === 3
        ? interpolate(FAIRWAY, distance)
        : interpolate(TEE_PAR4PLUS, distance);
    case "FAIRWAY":
      return interpolate(FAIRWAY, distance);
    case "ROUGH":
      return interpolate(ROUGH, distance);
    case "SAND":
      return interpolate(SAND, distance);
    case "RECOVERY":
      return interpolate(RECOVERY, distance);
    case "GREEN":
      return interpolate(GREEN_FT, distance);
    default: {
      const _exhaustive: never = lie;
      return _exhaustive;
    }
  }
}

export function categorize(startLie: Lie, startDistanceYds: number, holePar: number): Category {
  if (startLie === "GREEN") return "PUTTING";
  if (startLie === "TEE") return holePar === 3 ? "APPROACH" : "TEE";
  if (startDistanceYds <= 30) return "SHORT_GAME";
  return "APPROACH";
}
