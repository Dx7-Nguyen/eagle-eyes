import type {
  RoundInput,
  RoundDetail,
  RoundSummary,
  RoundEditData,
  DraftSummary,
  TrendPoint,
  CourseSearchResult,
  HandicapData,
} from "../../shared/types/index.js";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      message = await res.text().catch(() => `${res.status}`);
    }
    throw new Error(message);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  listRounds: () => http<RoundSummary[]>("/api/rounds"),
  getRound: (id: number) => http<RoundDetail>(`/api/rounds/${id}`),
  createRound: (input: RoundInput) =>
    http<RoundDetail>("/api/rounds", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  deleteRound: (id: number) =>
    http<void>(`/api/rounds/${id}`, { method: "DELETE" }),
  trends: () => http<TrendPoint[]>("/api/trends"),

  listDrafts: () => http<DraftSummary[]>("/api/rounds/drafts"),
  getRoundEditData: (id: number) => http<RoundEditData>(`/api/rounds/${id}/edit`),
  saveDraft: (input: RoundInput) =>
    http<DraftSummary>("/api/rounds/draft", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateDraft: (id: number, input: RoundInput) =>
    http<void>(`/api/rounds/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  publishRound: (id: number) =>
    http<RoundDetail>(`/api/rounds/${id}/publish`, { method: "POST" }),

  searchCourses: (q: string) =>
    http<CourseSearchResult[]>(`/api/courses/search?q=${encodeURIComponent(q)}`),

  getHandicap: () => http<HandicapData>("/api/handicap"),
};
