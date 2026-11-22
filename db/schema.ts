import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull().default(""),
  color: text("color").notNull().default("red"),
  demo: integer("demo", { mode: "boolean" }).notNull().default(false),
});

export const ratings = sqliteTable("ratings", {
  profileId: text("profile_id").notNull().references(() => profiles.id),
  filmId: text("film_id").notNull(),
  score: integer("score"),
}, (table) => [primaryKey({ columns: [table.profileId, table.filmId] }), index("ratings_by_film").on(table.filmId)]);

export const accounts = sqliteTable("accounts", {
  username: text("username").primaryKey(),
  profileId: text("profile_id").notNull().unique().references(() => profiles.id),
  salt: text("salt").notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  profileId: text("profile_id").notNull().references(() => profiles.id),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("sessions_by_expiration").on(table.expiresAt)]);

export const authAttempts = sqliteTable("auth_attempts", {
  scope: text("scope").primaryKey(),
  attempts: integer("attempts").notNull(),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("auth_attempts_by_expiration").on(table.expiresAt)]);
