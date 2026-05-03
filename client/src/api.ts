import type {
  RoundInput,
  RoundDetail,
  RoundSummary,
  RoundEditData,
  DraftSummary,
  TrendPoint,
} from "../../shared/types/index.js";

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
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
    fetch(`/api/rounds/${id}`, { method: "DELETE" }).then((r) => {
      if (!r.ok) throw new Error(`${r.status}`);
    }),
  trends: () => http<TrendPoint[]>("/api/trends"),

  listDrafts: () => http<DraftSummary[]>("/api/rounds/drafts"),
  getRoundEditData: (id: number) => http<RoundEditData>(`/api/rounds/${id}/edit`),
  saveDraft: (input: RoundInput) =>
    http<DraftSummary>("/api/rounds/draft", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateDraft: (id: number, input: RoundInput) =>
    fetch(`/api/rounds/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => { if (!r.ok) throw new Error(`${r.status}`); }),
  publishRound: (id: number) =>
    http<RoundDetail>(`/api/rounds/${id}/publish`, { method: "POST" }),
};
