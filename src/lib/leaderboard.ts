"use server";

import { headers } from "next/headers";

/**
 * Server Actions behind the Sky Hop leaderboard (top 5 with nicknames), stored in Upstash Redis.
 * Redis is reached through Upstash's HTTP API with plain `fetch` (no SDK), like Resend in contact.ts. Keys are
 * server-only env vars; without them every action returns null and the game simply shows no leaderboard.
 *
 * Anyone can call a Server Action directly, so a score is only accepted with a one-time "run ticket" from
 * `startRun()` that remembers when the run began; a claimed score must fit in the time that has passed since.
 */

export type TopScore = { name: string; score: number };

const BOARD = "skyhop:top"; // sorted set: member "<runId>:<name>", score = points
const TOP = 5;
const MAX_SCORE = 10_000;
// At the game's speed one pillar takes at least ~1.72 s (spacing 0.62 ÷ speed 0.36, both × canvas height); 1.6 s
// leaves room for network delay between the real start and the server's clock
const MIN_SECONDS_PER_POINT = 1.6;
const NAME = /^[\p{L}\p{N} _.-]{1,16}$/u;
const BLOCKED = ["fuck", "shit", "bitch", "cunt", "nigg", "fag", "rape", "nazi", "kurv", "pidh", "qir"];

type RedisValue = string | number | null | RedisValue[];

/** Runs Redis commands in one HTTP round trip (Upstash's /pipeline endpoint). Returns null if Redis isn't set up. */
async function redis(...commands: (string | number)[][]): Promise<RedisValue[] | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Leaderboard: Redis responded", res.status, await res.text());
      return null;
    }
    const out = (await res.json()) as { result?: RedisValue; error?: string }[];
    const failed = out.find((r) => r.error);
    if (failed) {
      console.error("Leaderboard: Redis error", failed.error);
      return null;
    }
    return out.map((r) => r.result ?? null);
  } catch (err) {
    console.error("Leaderboard: request failed", err);
    return null;
  }
}

/** A few requests per minute per visitor (by IP), counted in Redis. */
async function allowed(kind: string, perMinute: number) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `skyhop:rl:${kind}:${ip}`;
  const r = await redis(["INCR", key], ["EXPIRE", key, 60, "NX"]);
  return r !== null && Number(r[0]) <= perMinute;
}

/** ZRANGE … REV WITHSCORES comes back flat: [member, score, member, score, …] */
function parseTop(flat: RedisValue): TopScore[] {
  if (!Array.isArray(flat)) return [];
  const top: TopScore[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const member = String(flat[i]);
    top.push({ name: member.slice(member.indexOf(":") + 1), score: Number(flat[i + 1]) });
  }
  return top;
}

/** The current top 5, best first. Null when the leaderboard isn't available. */
export async function getTopScores(): Promise<TopScore[] | null> {
  const r = await redis(["ZRANGE", BOARD, 0, TOP - 1, "REV", "WITHSCORES"]);
  return r ? parseTop(r[0]) : null;
}

/** Called when a run starts: a one-time ticket that remembers the start time (expires after an hour). */
export async function startRun(): Promise<string | null> {
  if (!(await allowed("start", 40))) return null;
  const id = crypto.randomUUID();
  const r = await redis(["SET", `skyhop:run:${id}`, Date.now(), "EX", 3600]);
  return r ? id : null;
}

export type SubmitResult = { ok: true; top: TopScore[] } | { ok: false; error: string };

/** Saves a score to the top 5 if it's earned, plausible and makes the cut. */
export async function submitScore(runId: string, rawName: string, score: number): Promise<SubmitResult> {
  const name = rawName.trim().replace(/\s+/g, " ");
  if (!NAME.test(name)) return { ok: false, error: "Use up to 16 letters, numbers, spaces or _ . -" };
  const lower = name.toLowerCase();
  if (BLOCKED.some((w) => lower.includes(w))) return { ok: false, error: "Please pick a different nickname." };
  if (!Number.isInteger(score) || score < 1 || score > MAX_SCORE) return { ok: false, error: "That score can't be saved." };
  if (typeof runId !== "string" || !/^[0-9a-f-]{36}$/.test(runId)) return { ok: false, error: "That score can't be saved." };
  if (!(await allowed("submit", 5))) return { ok: false, error: "Too many tries. Wait a minute and try again." };

  // GETDEL: the ticket works once, so one run can't be saved twice
  const ticket = await redis(["GETDEL", `skyhop:run:${runId}`]);
  if (!ticket) return { ok: false, error: "The leaderboard is unavailable right now." };
  const startedAt = Number(ticket[0]);
  if (!startedAt) return { ok: false, error: "That run has expired. Play again to save a score." };
  const seconds = (Date.now() - startedAt) / 1000;
  if (seconds < (score - 1) * MIN_SECONDS_PER_POINT) return { ok: false, error: "That score can't be saved." };

  // Add, keep only the best 5 (ranks 0..-6 are everything below 5th), and read the board back in one round trip
  const r = await redis(
    ["ZADD", BOARD, score, `${runId}:${name}`],
    ["ZREMRANGEBYRANK", BOARD, 0, -(TOP + 1)],
    ["ZRANGE", BOARD, 0, TOP - 1, "REV", "WITHSCORES"],
  );
  if (!r) return { ok: false, error: "The leaderboard is unavailable right now." };
  return { ok: true, top: parseTop(r[2]) };
}
