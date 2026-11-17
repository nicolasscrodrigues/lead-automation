import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { qualifiedLeadSchema } from "@/lib/validation/lead";

function isValidToken(provided: string | null, expected: string): boolean {
  if (!provided) {
    return false;
  }

  const providedBuf = Buffer.from(provided, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

export async function POST(request: NextRequest) {
  const env = getEnv([
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "MOCK_CRM_MODE",
    "MOCK_CRM_TOKEN",
  ]);

  const token = request.headers.get("x-mock-token");

  if (!isValidToken(token, env.MOCK_CRM_TOKEN)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (env.MOCK_CRM_MODE === "unavailable") {
    return NextResponse.json(
      { error: "CRM indisponível (mock)" },
      { status: 503 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON inválido no corpo da requisição" },
      { status: 400 }
    );
  }

  const parsed = qualifiedLeadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Payload inválido",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("lead_logs")
    .insert({
      lead_id: payload.lead_id ?? null,
      email: payload.email,
      evento: "crm_recebido",
      status: "sucesso",
      detalhes: {
        ...payload,
        mock: true,
      },
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[mock-crm/leads] Erro ao inserir em lead_logs:", error);
    return NextResponse.json(
      { error: "Erro interno ao registrar log no CRM" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, log_id: data.id }, { status: 200 });
}
