import { env } from "cloudflare:workers";
import { getSessionProfile } from "../../../lib/session";
import { isSameOriginJson, readJsonObject, responseJson as json } from "../../../lib/site-request";
import { demoViewers } from "../../../lib/demo";
import { filmsById } from "../../../lib/films";
import { buildResults, type Scores, type Viewer } from "../../../lib/taste";

export const dynamic = "force-dynamic";

async function getDatabase() {
  const db = env.DB;
  if (!db) throw new Error("D1 binding is unavailable");
  const { results } = await db.prepare("SELECT id FROM profiles WHERE demo = 1").all<{ id: string }>();
  const existing = new Set(results.map((row) => row.id));
  for (const profile of demoViewers) {
    if (existing.has(profile.id)) continue;
    const statements = [
      db.prepare("INSERT OR IGNORE INTO profiles (id, name, bio, color, demo) VALUES (?, ?, ?, ?, 1)")
        .bind(profile.id, profile.name, profile.bio, profile.color),
    ];
    const entries = Object.entries(profile.ratings);
    // Keep each statement below D1's bound-parameter limit.
    for (let offset = 0; offset < entries.length; offset += 24) {
      const chunk = entries.slice(offset, offset + 24);
      const placeholders = chunk.map(() => "(?, ?, ?)").join(", ");
      statements.push(db.prepare(`INSERT OR IGNORE INTO ratings (profile_id, film_id, score) VALUES ${placeholders}`)
        .bind(...chunk.flatMap(([filmId, score]) => [profile.id, filmId, score])));
    }
    await db.batch(statements);
  }
  return db;
}

async function readProfile(db: D1Database, id: string) {
  return db.prepare("SELECT name, color FROM profiles WHERE id = ? AND demo = 0").bind(id)
    .first<{ name: string; color: string }>();
}

export async function GET(request: Request) {
  try {
    const db = await getDatabase();
    const id = await getSessionProfile(db, request);
    const profile = id ? await readProfile(db, id) : null;
    if (!profile || !id) return json({ signedIn: false, profile: null });
    const [own, community] = await db.batch([
      db.prepare("SELECT film_id, score FROM ratings WHERE profile_id = ?").bind(id),
      db.prepare(`SELECT p.id, p.name, p.bio, p.color, p.demo
        FROM ratings mine
        JOIN ratings r ON r.film_id = mine.film_id AND r.score IS NOT NULL
        JOIN profiles p ON p.id = r.profile_id
        WHERE mine.profile_id = ? AND mine.score IS NOT NULL AND p.id <> ?
        GROUP BY p.id HAVING COUNT(*) >= 5
        ORDER BY (1 + SUM(ABS(mine.score - r.score)) * 0.25) / (COUNT(*) + 2), COUNT(*) DESC, p.id
        LIMIT 24`).bind(id, id),
    ]) as [D1Result<{ film_id: string; score: number | null }>, D1Result<Omit<Viewer, "ratings" | "demo"> & { demo: number }>];
    const scores: Scores = Object.fromEntries(own.results.map((row) => [row.film_id, row.score]));
    const candidates = new Map(community.results.map((row) => [row.id, {
      id: row.id, name: row.name, bio: row.bio, color: row.color, demo: Boolean(row.demo), ratings: {} as Scores,
    }]));
    if (candidates.size) {
      const { results } = await db.prepare(`SELECT profile_id, film_id, score FROM ratings WHERE profile_id IN (${[...candidates].map(() => "?").join(",")})`)
        .bind(...candidates.keys()).all<{ profile_id: string; film_id: string; score: number | null }>();
      for (const row of results) candidates.get(row.profile_id)!.ratings[row.film_id] = row.score;
    }
    const { matches, recommendations } = buildResults(scores, [...candidates.values()]);
    return json({ signedIn: true, profile, scores, recommendations, matches: matches.map((match, index) => ({ ...match, id: `match-${index}` })) });
  } catch (error) {
    console.error("Could not read Match Cut data", error);
    return json({ error: "We couldn't load your film profile. Please try again." }, 503);
  }
}

export async function POST(request: Request) {
  if (!isSameOriginJson(request)) {
    return json({ error: "Open Match Cut to update your profile." }, 403);
  }
  try {
    const db = env.DB;
    if (!db) throw new Error("D1 binding is unavailable");
    const id = await getSessionProfile(db, request);
    if (!id) return json({ error: "Sign in to save your ratings." }, 401);
    const body = await readJsonObject(request);
    if (!body) return json({ error: "Invalid request." }, 400);
    if (body.action === "profile") {
      const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
      if (name.length < 2 || name.length > 30) return json({ error: "Use a display name of 2 to 30 characters." }, 400);
      await db.prepare("UPDATE profiles SET name = ? WHERE id = ? AND demo = 0").bind(name, id).run();
      return json({ saved: true });
    }
    if (!await readProfile(db, id)) return json({ error: "Create your profile first." }, 403);
    if (typeof body.filmId !== "string" || !filmsById.has(body.filmId)) return json({ error: "Film not found." }, 404);
    if (body.action === "clear") {
      await db.prepare("DELETE FROM ratings WHERE profile_id = ? AND film_id = ?").bind(id, body.filmId).run();
      return json({ saved: true });
    }
    const score = body.score;
    if (body.action !== "rate" || (score !== null && (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5))) {
      return json({ error: "Choose between one and five stars." }, 400);
    }
    await db.prepare(`INSERT INTO ratings (profile_id, film_id, score) VALUES (?, ?, ?)
      ON CONFLICT(profile_id, film_id) DO UPDATE SET score = excluded.score`).bind(id, body.filmId, score).run();
    return json({ saved: true });
  } catch (error) {
    console.error("Could not save Match Cut data", error);
    return json({ error: "We couldn't save your change. Please try again." }, 503);
  }
}
