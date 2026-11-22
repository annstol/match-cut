import { scryptSync, timingSafeEqual } from "node:crypto";

const cookieName = "__Host-match_cut";
const sessionLifetime = 14 * 24 * 60 * 60;
const windowSeconds = 15 * 60;
const encoder = new TextEncoder();

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string) {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function now() {
  return Math.floor(Date.now() / 1000);
}

async function digest(value: string) {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

export function newSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

export function derivePassword(password: string, salt: string) {
  return scryptSync(password, fromHex(salt), 32, {
    N: 32_768,
    r: 8,
    p: 3,
    maxmem: 48 * 1024 * 1024,
  }).toString("hex");
}

export function passwordMatches(actual: string, expected: string) {
  return timingSafeEqual(fromHex(actual), fromHex(expected));
}

function sessionCookie(token: string, age: number) {
  return `${cookieName}=${token}; Max-Age=${age}; Path=/; Secure; HttpOnly; SameSite=Lax`;
}

async function requestTokenHash(request: Request) {
  const value = request.headers.get("cookie")?.match(/(?:^|;\s*)__Host-match_cut=([a-f0-9]{64})(?=;|$)/)?.[1];
  return value ? digest(value) : null;
}

export async function getSessionProfile(db: D1Database, request: Request) {
  const hash = await requestTokenHash(request);
  if (!hash) return null;

  const session = await db.prepare("SELECT profile_id FROM sessions WHERE token_hash = ? AND expires_at > ?")
    .bind(hash, now()).first<{ profile_id: string }>();
  return session?.profile_id ?? null;
}

export async function makeSession(db: D1Database, profileId: string) {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  const hash = await digest(token);
  const current = now();
  return {
    statement: db.prepare("INSERT INTO sessions (token_hash, profile_id, expires_at) VALUES (?, ?, ?)")
      .bind(hash, profileId, current + sessionLifetime),
    cookie: sessionCookie(token, sessionLifetime),
  };
}

export async function endSession(db: D1Database, request: Request) {
  const hash = await requestTokenHash(request);
  if (hash) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(hash).run();
  return sessionCookie("", 0);
}

export async function allowAuthenticationAttempt(db: D1Database, request: Request, action: "login" | "register", username: string) {
  const current = now();
  const expires = current + windowSeconds;
  const ip = request.headers.get("CF-Connecting-IP") ?? "local";
  const scopes = action === "login"
    ? [{ key: `login-ip:${ip}`, limit: 60 }, { key: `login-pair:${ip}:${username}`, limit: 10 }]
    : [{ key: `register-ip:${ip}`, limit: 30 }];
  const counts = await db.batch<{ attempts: number }>([
    db.prepare("DELETE FROM auth_attempts WHERE expires_at <= ?").bind(current),
    ...await Promise.all(scopes.map(async ({ key }) => db.prepare(`
      INSERT INTO auth_attempts (scope, attempts, expires_at) VALUES (?, 1, ?)
      ON CONFLICT(scope) DO UPDATE SET attempts = MIN(attempts + 1, 100)
      RETURNING attempts`).bind(await digest(key), expires))),
  ]);
  return scopes.every(({ limit }, index) => counts[index + 1].results[0].attempts <= limit);
}
