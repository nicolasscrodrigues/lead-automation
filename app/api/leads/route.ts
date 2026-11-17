import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { leadFormSchema } from "@/lib/validation/lead";

const GENERIC_SUBMISSION_ERROR =
  "Não foi possível enviar seu contato. Tente novamente.";

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON inválido no corpo da requisição" },
      { status: 400 }
    );
  }

  const parsed = leadFormSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Payload inválido",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  let webhookUrl: string;
  try {
    const env = getEnv(["N8N_WEBHOOK_URL"]);
    webhookUrl = env.N8N_WEBHOOK_URL;
  } catch {
    console.error("[api/leads] Variável N8N_WEBHOOK_URL ausente ou inválida.");
    return NextResponse.json(
      { ok: false, error: GENERIC_SUBMISSION_ERROR },
      { status: 502 }
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    console.error(
      `[api/leads] Webhook respondeu com status não-2xx: ${response.status}`
    );
    return NextResponse.json(
      { ok: false, error: GENERIC_SUBMISSION_ERROR },
      { status: 502 }
    );
  } catch (err) {
    console.error(
      "[api/leads] Falha ou timeout ao comunicar com o webhook:",
      err instanceof Error ? err.name : "UnknownError"
    );
    return NextResponse.json(
      { ok: false, error: GENERIC_SUBMISSION_ERROR },
      { status: 502 }
    );
  }
}
