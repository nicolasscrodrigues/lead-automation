import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface LeadListItem {
  id: string;
  created_at: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  cargo: string | null;
  classificacao: string | null;
  status_final: string;
}

export async function listLeads(): Promise<LeadListItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, created_at, nome, email, telefone, empresa, cargo, classificacao, status_final"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return (data as LeadListItem[]) ?? [];
}
