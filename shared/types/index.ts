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
  courseExternalId?: number | null;
  courseRating?: number | null;
  slopeRating?: number | null;
  teeName?: string | null;
  date?: string;
  holes: HoleInput[];
}

export interface HandicapData {
  handicapIndex: number | null;
  usedCount: number;
  eligibleCount: number;
  minRequired: 3;
  differentials: Array<{
    roundId: number;
    date: string;
    course: string;
    differential: number;
    used: boolean;
  }>;
}

export interface CourseTeeHole {
  par: number;
  yardage: number;
}

export interface CourseTee {
  tee_name: string;
  par_total: number;
  total_yards: number;
  course_rating: number;
  slope_rating: number;
  number_of_holes: number;
  holes: CourseTeeHole[];
}

export interface CourseSearchResult {
  id: number;
  name: string;
  location?: string;
  tees?: {
    male?: CourseTee[];
    female?: CourseTee[];
  };
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

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  gender: string;
}

export interface RoundEditData {
  id: number;
  course: string;
  courseExternalId: number | null;
  courseRating: number | null;
  slopeRating: number | null;
  teeName: string | null;
  date: string;
  status: "DRAFT" | "PUBLISHED";
  holes: HoleInput[];
}
