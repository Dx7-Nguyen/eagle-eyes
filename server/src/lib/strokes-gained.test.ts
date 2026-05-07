import { describe, it, expect } from "vitest";
import {
  shotStrokesGained,
  annotateHole,
  sumSG,
  sgTotal,
  EMPTY_SG_BY_CATEGORY,
} from "./strokes-gained.js";
import type { HoleInput } from "../../../shared/types/index.js";

// ── shotStrokesGained ─────────────────────────────────────────────────────────

describe("shotStrokesGained", () => {
  it("holing out in one from 150y fairway is massively positive", () => {
    // expected(FAIRWAY, 150) ≈ 2.98; expected(HOLE, 0) = 0; SG = 2.98 - 0 - 1 = 1.98
    const sg = shotStrokesGained(
      { shotNumber: 1, startLie: "FAIRWAY", startDistance: 150, endLie: "HOLE", endDistance: 0 },
      4,
    );
    expect(sg).toBeCloseTo(1.98, 1);
  });

  it("leaving a putt at the same distance has negative SG", () => {
    // expected(GREEN, 10) ≈ 1.61; expected(GREEN, 10) ≈ 1.61; SG = 1.61 - 1.61 - 1 = -1
    const sg = shotStrokesGained(
      { shotNumber: 1, startLie: "GREEN", startDistance: 10, endLie: "GREEN", endDistance: 10 },
      4,
    );
    expect(sg).toBeCloseTo(-1, 1);
  });

  it("sinking a 10ft putt has positive SG", () => {
    // expected(GREEN, 10) ≈ 1.61; expected(HOLE, 0) = 0; SG = 1.61 - 0 - 1 = 0.61
    const sg = shotStrokesGained(
      { shotNumber: 1, startLie: "GREEN", startDistance: 10, endLie: "HOLE", endDistance: 0 },
      4,
    );
    expect(sg).toBeCloseTo(0.61, 1);
  });

  it("always returns a finite number", () => {
    const sg = shotStrokesGained(
      { shotNumber: 1, startLie: "ROUGH", startDistance: 75, endLie: "FAIRWAY", endDistance: 30 },
      5,
    );
    expect(Number.isFinite(sg)).toBe(true);
  });
});

// ── annotateHole ──────────────────────────────────────────────────────────────

describe("annotateHole", () => {
  it("passes through hole number and par", () => {
    const hole: HoleInput = {
      number: 7,
      par: 3,
      shots: [{ shotNumber: 1, startLie: "TEE", startDistance: 150, endLie: "HOLE", endDistance: 0 }],
    };
    const result = annotateHole(hole);
    expect(result.number).toBe(7);
    expect(result.par).toBe(3);
  });

  it("counts strokes correctly", () => {
    const hole: HoleInput = {
      number: 1,
      par: 4,
      shots: [
        { shotNumber: 1, startLie: "TEE", startDistance: 400, endLie: "FAIRWAY", endDistance: 120 },
        { shotNumber: 2, startLie: "FAIRWAY", startDistance: 120, endLie: "GREEN", endDistance: 8 },
        { shotNumber: 3, startLie: "GREEN", startDistance: 8, endLie: "HOLE", endDistance: 0 },
      ],
    };
    expect(annotateHole(hole).strokes).toBe(3);
  });

  it("assigns TEE category to tee shot on par 4", () => {
    const hole: HoleInput = {
      number: 1,
      par: 4,
      shots: [{ shotNumber: 1, startLie: "TEE", startDistance: 400, endLie: "FAIRWAY", endDistance: 100 }],
    };
    expect(annotateHole(hole).shots[0].category).toBe("TEE");
  });

  it("assigns PUTTING category to green shot", () => {
    const hole: HoleInput = {
      number: 2,
      par: 4,
      shots: [{ shotNumber: 1, startLie: "GREEN", startDistance: 12, endLie: "HOLE", endDistance: 0 }],
    };
    expect(annotateHole(hole).shots[0].category).toBe("PUTTING");
  });

  it("assigns APPROACH to tee shot on par 3", () => {
    const hole: HoleInput = {
      number: 3,
      par: 3,
      shots: [{ shotNumber: 1, startLie: "TEE", startDistance: 160, endLie: "GREEN", endDistance: 15 }],
    };
    expect(annotateHole(hole).shots[0].category).toBe("APPROACH");
  });

  it("assigns SHORT_GAME when within 30y from non-green lie", () => {
    const hole: HoleInput = {
      number: 4,
      par: 4,
      shots: [{ shotNumber: 1, startLie: "ROUGH", startDistance: 25, endLie: "GREEN", endDistance: 10 }],
    };
    expect(annotateHole(hole).shots[0].category).toBe("SHORT_GAME");
  });

  it("accumulates SG correctly into sgByCategory", () => {
    const hole: HoleInput = {
      number: 1,
      par: 4,
      shots: [
        { shotNumber: 1, startLie: "TEE", startDistance: 400, endLie: "FAIRWAY", endDistance: 100 },
        { shotNumber: 2, startLie: "FAIRWAY", startDistance: 100, endLie: "GREEN", endDistance: 10 },
        { shotNumber: 3, startLie: "GREEN", startDistance: 10, endLie: "HOLE", endDistance: 0 },
      ],
    };
    const result = annotateHole(hole);
    // Each category sum matches corresponding shot SG
    expect(result.sgByCategory.TEE).toBeCloseTo(result.shots[0].strokesGained);
    expect(result.sgByCategory.APPROACH).toBeCloseTo(result.shots[1].strokesGained);
    expect(result.sgByCategory.PUTTING).toBeCloseTo(result.shots[2].strokesGained);
    expect(result.sgByCategory.SHORT_GAME).toBeCloseTo(0);
  });
});

// ── sumSG ─────────────────────────────────────────────────────────────────────

describe("sumSG", () => {
  it("returns all zeros for empty array", () => {
    expect(sumSG([])).toEqual(EMPTY_SG_BY_CATEGORY);
  });

  it("sums across two holes correctly", () => {
    const result = sumSG([
      { TEE: 1.0, APPROACH: -0.5, SHORT_GAME: 0.2, PUTTING: -0.1 },
      { TEE: 0.5, APPROACH: 0.3, SHORT_GAME: -0.2, PUTTING: 0.4 },
    ]);
    expect(result.TEE).toBeCloseTo(1.5);
    expect(result.APPROACH).toBeCloseTo(-0.2);
    expect(result.SHORT_GAME).toBeCloseTo(0.0);
    expect(result.PUTTING).toBeCloseTo(0.3);
  });

  it("does not mutate the input objects", () => {
    const a = { TEE: 1, APPROACH: 1, SHORT_GAME: 1, PUTTING: 1 };
    sumSG([a]);
    expect(a.TEE).toBe(1);
  });
});

// ── sgTotal ───────────────────────────────────────────────────────────────────

describe("sgTotal", () => {
  it("sums all four categories", () => {
    expect(sgTotal({ TEE: 1, APPROACH: 0.5, SHORT_GAME: -0.25, PUTTING: 0.25 })).toBeCloseTo(1.5);
  });

  it("returns 0 for empty baseline", () => {
    expect(sgTotal(EMPTY_SG_BY_CATEGORY)).toBe(0);
  });

  it("handles negative totals", () => {
    expect(sgTotal({ TEE: -1, APPROACH: -1, SHORT_GAME: -1, PUTTING: -1 })).toBeCloseTo(-4);
  });
});
