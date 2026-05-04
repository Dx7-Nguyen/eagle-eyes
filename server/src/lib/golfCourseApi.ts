import type { CourseSearchResult } from "../../../shared/types/index.js";

const API_KEY = process.env.GOLF_COURSE_API_KEY ?? "";
const BASE_URL = "https://api.golfcourseapi.com";

interface UpstreamCourse {
  id: number;
  club_name?: string;
  course_name?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
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
    }));
  } catch {
    return [];
  }
}
