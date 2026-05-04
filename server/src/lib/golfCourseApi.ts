import type { CourseSearchResult, CourseTee } from "../../../shared/types/index.js";

const API_KEY = process.env.GOLF_COURSE_API_KEY ?? "";
const BASE_URL = "https://api.golfcourseapi.com";

interface UpstreamTeeHole {
  par?: number;
  yardage?: number;
}

interface UpstreamTee {
  tee_name?: string;
  par_total?: number;
  total_yards?: number;
  course_rating?: number;
  slope_rating?: number;
  number_of_holes?: number;
  holes?: UpstreamTeeHole[];
}

interface UpstreamCourse {
  id: number;
  club_name?: string;
  course_name?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  tees?: {
    male?: UpstreamTee[];
    female?: UpstreamTee[];
  };
}

interface UpstreamSearchResponse {
  courses?: UpstreamCourse[];
}

function buildName(c: UpstreamCourse): string {
  const club = c.club_name?.trim();
  const course = c.course_name?.trim();
  if (club && course && club !== course) return `${club} — ${course}`;
  return club || course || `Course ${c.id}`;
}

function buildLocation(c: UpstreamCourse): string | undefined {
  const parts = [c.location?.city, c.location?.state, c.location?.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function normalizeTees(tees: UpstreamTee[] | undefined): CourseTee[] | undefined {
  if (!tees || tees.length === 0) return undefined;
  return tees.map((t) => ({
    tee_name: t.tee_name ?? "Unknown",
    par_total: t.par_total ?? 0,
    total_yards: t.total_yards ?? 0,
    course_rating: t.course_rating ?? 0,
    slope_rating: t.slope_rating ?? 0,
    number_of_holes: t.number_of_holes ?? 0,
    holes: (t.holes ?? []).map((h) => ({ par: h.par ?? 4, yardage: h.yardage ?? 0 })),
  }));
}

export async function searchCourses(query: string): Promise<CourseSearchResult[]> {
  if (!API_KEY) return [];
  const url = `${BASE_URL}/v1/search?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Key ${API_KEY}` },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as UpstreamSearchResponse;
    return (body.courses ?? []).map((c) => ({
      id: c.id,
      name: buildName(c),
      location: buildLocation(c),
      tees: {
        male: normalizeTees(c.tees?.male),
        female: normalizeTees(c.tees?.female),
      },
    }));
  } catch {
    return [];
  }
}
