import { describe, it, expect } from "vitest";
import { expectedStrokes, categorize } from "./baselines.js";

// ── expectedStrokes ───────────────────────────────────────────────────────────

describe("expectedStrokes", () => {
  it("returns 0 when lie is HOLE", () => {
    expect(expectedStrokes("HOLE", 100, 4)).toBe(0);
  });

  it("returns 0 when distance is 0", () => {
    expect(expectedStrokes("FAIRWAY", 0, 4)).toBe(0);
  });

  // Fairway table has exact entries at 150y = 2.98
  it("returns exact table value for fairway at 150y", () => {
    expect(expectedStrokes("FAIRWAY", 150, 4)).toBeCloseTo(2.98);
  });

  // Interpolation: midpoint between 100y (2.80) and 125y (2.89) = 2.845
  it("interpolates fairway between table entries", () => {
    expect(expectedStrokes("FAIRWAY", 112.5, 4)).toBeCloseTo(2.845);
  });

  // TEE on par 3 uses the FAIRWAY table
  it("par-3 tee shot uses fairway table", () => {
    expect(expectedStrokes("TEE", 150, 3)).toBeCloseTo(expectedStrokes("FAIRWAY", 150, 3));
  });

  // TEE on par 4/5 uses par4+ tee table: 400y = 4.17
  it("par-4 tee shot uses tee table", () => {
    expect(expectedStrokes("TEE", 400, 4)).toBeCloseTo(4.17);
  });

  // Par-5 tee also uses tee table
  it("par-5 tee shot uses tee table", () => {
    expect(expectedStrokes("TEE", 500, 5)).toBeCloseTo(4.5);
  });

  // Rough is harder than fairway
  it("rough is harder than fairway at same distance", () => {
    expect(expectedStrokes("ROUGH", 150, 4)).toBeGreaterThan(expectedStrokes("FAIRWAY", 150, 4));
  });

  // Sand is harder than rough
  it("sand is harder than rough at same distance", () => {
    expect(expectedStrokes("SAND", 100, 4)).toBeGreaterThan(expectedStrokes("ROUGH", 100, 4));
  });

  // Recovery is the hardest
  it("recovery is hardest lie", () => {
    expect(expectedStrokes("RECOVERY", 100, 4)).toBeGreaterThan(expectedStrokes("SAND", 100, 4));
  });

  // Green uses feet — 10ft = 1.61
  it("green at 10ft returns correct expected strokes", () => {
    expect(expectedStrokes("GREEN", 10, 4)).toBeCloseTo(1.61);
  });

  // Clamps at table upper bound
  it("clamps to max table value when distance exceeds table", () => {
    const at600 = expectedStrokes("FAIRWAY", 600, 4);
    const at1000 = expectedStrokes("FAIRWAY", 1000, 4);
    expect(at600).toBe(at1000);
  });

  // Clamps at table lower bound
  it("clamps to min table value for very short distance (non-zero)", () => {
    expect(expectedStrokes("FAIRWAY", 1, 4)).toBeCloseTo(expectedStrokes("FAIRWAY", 5, 4));
  });
});

// ── categorize ────────────────────────────────────────────────────────────────

describe("categorize", () => {
  it("GREEN lie → PUTTING", () => {
    expect(categorize("GREEN", 15, 4)).toBe("PUTTING");
  });

  it("TEE on par 4 → TEE", () => {
    expect(categorize("TEE", 400, 4)).toBe("TEE");
  });

  it("TEE on par 5 → TEE", () => {
    expect(categorize("TEE", 500, 5)).toBe("TEE");
  });

  it("TEE on par 3 → APPROACH", () => {
    expect(categorize("TEE", 160, 3)).toBe("APPROACH");
  });

  it("FAIRWAY shot > 30y → APPROACH", () => {
    expect(categorize("FAIRWAY", 100, 4)).toBe("APPROACH");
  });

  it("FAIRWAY shot exactly 30y → SHORT_GAME", () => {
    expect(categorize("FAIRWAY", 30, 4)).toBe("SHORT_GAME");
  });

  it("FAIRWAY shot < 30y → SHORT_GAME", () => {
    expect(categorize("FAIRWAY", 20, 4)).toBe("SHORT_GAME");
  });

  it("ROUGH shot ≤ 30y → SHORT_GAME", () => {
    expect(categorize("ROUGH", 25, 4)).toBe("SHORT_GAME");
  });

  it("SAND shot ≤ 30y → SHORT_GAME", () => {
    expect(categorize("SAND", 15, 5)).toBe("SHORT_GAME");
  });

  it("RECOVERY shot > 30y → APPROACH", () => {
    expect(categorize("RECOVERY", 50, 4)).toBe("APPROACH");
  });
});
