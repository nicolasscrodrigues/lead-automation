import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { getEnv } from "@/lib/env";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const INVALID_CREDENTIALS_MESSAGE = "Usuário ou senha inválidos.";

function timingSafeCompareStrings(a: string, b: string): boolean {
  const aHash = crypto.createHash("sha256").update(a, "utf8").digest();
  const bHash = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(aHash, bHash) && a.length === b.length;
}

/**
 * Resolve ADMIN_PASSWORD_HASH preserving literal `$` characters if `@next/env`
 * (`dotenv-expand`) truncated an unescaped `$2b$...` hash in `.env.local`.
 */
function resolveAdminPasswordHash(): string {
  const { ADMIN_PASSWORD_HASH } = getEnv(["ADMIN_PASSWORD_HASH"]);
  if (ADMIN_PASSWORD_HASH.startsWith("$2") && ADMIN_PASSWORD_HASH.length >= 59) {
    return ADMIN_PASSWORD_HASH;
  }

  try {
    const envLocalPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^\s*ADMIN_PASSWORD_HASH\s*=\s*(.*)\s*$/);
        if (match) {
          let raw = match[1].trim();
          if (
            (raw.startsWith('"') && raw.endsWith('"')) ||
            (raw.startsWith("'") && raw.endsWith("'"))
          ) {
            raw = raw.slice(1, -1);
          }
          raw = raw.replace(/\\\$/g, "$");
          if (raw.length > 0) {
            return raw;
          }
        }
      }
    }
  } catch {
    // Fallback to process.env value
  }

  return ADMIN_PASSWORD_HASH;
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: INVALID_CREDENTIALS_MESSAGE },
      { status: 401 }
    );
  }

  const parsed = loginSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: INVALID_CREDENTIALS_MESSAGE },
      { status: 401 }
    );
  }

  const { username, password } = parsed.data;
  const { ADMIN_USERNAME } = getEnv(["ADMIN_USERNAME"]);
  const adminPasswordHash = resolveAdminPasswordHash();

  const isUsernameValid = timingSafeCompareStrings(username, ADMIN_USERNAME);
  const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);

  if (!isUsernameValid || !isPasswordValid) {
    return NextResponse.json(
      { ok: false, error: INVALID_CREDENTIALS_MESSAGE },
      { status: 401 }
    );
  }

  await createSession(username);

  return NextResponse.json({ ok: true }, { status: 200 });
}
