import { env } from "cloudflare:workers";
import { allowAuthenticationAttempt, derivePassword, endSession, makeSession, newSalt, passwordMatches } from "../../../lib/session";
import { isSameOriginJson, readJsonObject, responseJson as json } from "../../../lib/site-request";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginJson(request)) return json({ error: "Open Match Cut to manage your account." }, 403);

  const body = await readJsonObject(request);
  const action = body?.action;
  if (action !== "register" && action !== "login" && action !== "logout") {
    return json({ error: "Invalid request." }, 400);
  }

  try {
    const db = env.DB;
    if (!db) throw new Error("D1 binding is unavailable");

    if (action === "logout") {
      return json({ saved: true }, 200, { "Set-Cookie": await endSession(db, request) });
    }

    const name = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(name)) {
      return json({ error: "Use 3–24 letters, numbers or underscores for your username." }, 400);
    }
    if (password.length < 12 || password.length > 128) {
      return json({ error: "Use a password with 12–128 characters." }, 400);
    }

    const username = name.toLowerCase();
    if (!await allowAuthenticationAttempt(db, request, action, username)) {
      return json({ error: "Too many attempts. Try again in about 15 minutes." }, 429);
    }

    const account = await db.prepare("SELECT profile_id, salt, password_hash FROM accounts WHERE username = ?")
      .bind(username).first<{ profile_id: string; salt: string; password_hash: string }>();
    const cleanup = db.prepare("DELETE FROM sessions WHERE expires_at <= unixepoch()");

    if (action === "login") {
      const hash = derivePassword(password, account?.salt ?? "00000000000000000000000000000000");
      if (!account || !passwordMatches(hash, account.password_hash)) {
        return json({ error: "That username or password is incorrect." }, 401);
      }

      const session = await makeSession(db, account.profile_id);
      await db.batch([cleanup, session.statement]);
      return json({ saved: true }, 200, { "Set-Cookie": session.cookie });
    }

    if (account) return json({ error: "That username is already taken." }, 409);
    const profileId = `member:${crypto.randomUUID()}`;
    const salt = newSalt();
    const hash = derivePassword(password, salt);
    const session = await makeSession(db, profileId);
    try {
      await db.batch([
        db.prepare("INSERT INTO profiles (id, name) VALUES (?, ?)").bind(profileId, name),
        db.prepare("INSERT INTO accounts (username, profile_id, salt, password_hash) VALUES (?, ?, ?, ?)")
          .bind(username, profileId, salt, hash),
        cleanup,
        session.statement,
      ]);
    } catch (error) {
      if (await db.prepare("SELECT 1 FROM accounts WHERE username = ?").bind(username).first()) {
        return json({ error: "That username is already taken." }, 409);
      }
      throw error;
    }
    return json({ saved: true }, 201, { "Set-Cookie": session.cookie });
  } catch (error) {
    console.error("Could not complete Match Cut authentication", error);
    return json({ error: "We couldn't complete that request. Please try again." }, 503);
  }
}
