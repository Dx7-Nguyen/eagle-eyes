export type Lie = "TEE" | "FAIRWAY" | "ROUGH" | "SAND" | "RECOVERY" | "GREEN";
export type EndLie = Lie | "HOLE";
export type Category = "TEE" | "APPROACH" | "SHORT_GAME" | "PUTTING";

export interface Shot {
  shotNumber: number;
  startLie: Lie;
  startDistance: number;
  endLie: EndLie;
  endDistance: number;
}

export interface ShotWithSG extends Shot {
  category: Category;
  strokesGained: number;
}

export interface HoleInput {
  number: number;
  par: number;
  shots: Shot[];
}

export interface HoleResult {
  number: number;
  par: number;
  strokes: number;
  shots: ShotWithSG[];
  sgByCategory: Record<Category, number>;
}

export interface RoundInput {
  course: string;
  date?: string;
  holes: HoleInput[];
}

export interface RoundSummary {
  id: number;
  course: string;
  date: string;
  totalStrokes: number;
  totalPar: number;
  sgByCategory: Record<Category, number>;
  sgTotal: number;
}

export interface RoundDetail extends RoundSummary {
  holes: HoleResult[];
}

export interface TrendPoint {
  roundId: number;
  date: string;
  sgByCategory: Record<Category, number>;
  sgTotal: number;
}

export interface DraftSummary {
  id: number;
  course: string;
  date: string;
  holeCount: number;
}

export interface RoundEditData {
  id: number;
  course: string;
  date: string;
  status: "DRAFT" | "PUBLISHED";
  holes: HoleInput[];
}
