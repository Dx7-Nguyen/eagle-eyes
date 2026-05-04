import { Router } from "express";
import type { CourseSearchResult } from "../../../shared/types/index.js";
import { requireAuth } from "../middleware/auth.js";
import { searchCourses } from "../lib/golfCourseApi.js";

export const coursesRouter = Router();

coursesRouter.use(requireAuth);

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { results: CourseSearchResult[]; expires: number }>();

coursesRouter.get("/search", async (req, res) => {
  const query = String(req.query.q ?? "").trim();
  if (query.length < 2) {
    res.json([]);
    return;
  }

  const key = query.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    res.json(cached.results);
    return;
  }

  const results = await searchCourses(query);
  cache.set(key, { results, expires: Date.now() + CACHE_TTL_MS });
  res.json(results);
});
