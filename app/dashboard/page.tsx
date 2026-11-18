import { Suspense } from "react";
import { listLeads, type LeadListItem } from "@/lib/leads/queries";
import { LogoutButton } from "@/components/LogoutButton";

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

type NormalizedClassification = "quente" | "morno" | "frio" | "nao_classificado";

function normalizeClassification(
  classification: string | null
): NormalizedClassification {
  if (!classification) return "nao_classificado";
  const normalized = classification.trim().toLowerCase();
  if (normalized === "quente" || normalized === "hot") return "quente";
  if (normalized === "morno" || normalized === "warm") return "morno";
  if (normalized === "frio" || normalized === "cold") return "frio";
  return "nao_classificado";
}

function renderClassificationBadge(classification: string | null) {
  const normalized = normalizeClassification(classification);

  if (normalized === "quente") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/60 dark:text-red-300">
        Quente
      </span>
    );
  }
  if (normalized === "morno") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
        Morno
      </span>
    );
  }
  if (normalized === "frio") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
        Frio
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      Não classificado
    </span>
  );
}

async function LeadsData() {
  let leads: LeadListItem[] = [];
  let hasError = false;

  try {
    leads = await listLeads();
  } catch (error) {
    console.error("Erro ao carregar leads no dashboard:", error);
    hasError = true;
  }

  const total = leads.length;
  let quenteCount = 0;
  let mornoCount = 0;
  let frioCount = 0;
  let unclassifiedCount = 0;

  for (const lead of leads) {
    const category = normalizeClassification(lead.classificacao);
    if (category === "quente") {
      quenteCount++;
    } else if (category === "morno") {
      mornoCount++;
    } else if (category === "frio") {
      frioCount++;
    } else {
      unclassifiedCount++;
    }
  }

  return (
    <>
      {/* Indicadores simples no topo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total de Leads</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{total}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">Quente</p>
          <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">{quenteCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Morno</p>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{mornoCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Frio</p>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">{frioCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Não classificado</p>
          <p className="mt-1 text-2xl font-bold text-zinc-700 dark:text-zinc-300">{unclassifiedCount}</p>
        </div>
      </div>

      {/* Tabela ou Mensagens */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        {hasError ? (
          <div className="p-8 text-center text-sm text-red-600 dark:text-red-400">
            Não foi possível carregar os leads.
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum lead recebido
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Data e hora</th>
                  <th scope="col" className="px-4 py-3">Nome</th>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Telefone</th>
                  <th scope="col" className="px-4 py-3">Empresa</th>
                  <th scope="col" className="px-4 py-3">Cargo</th>
                  <th scope="col" className="px-4 py-3">Classificação</th>
                  <th scope="col" className="px-4 py-3">Status final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(lead.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {lead.nome ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {lead.email ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {lead.telefone ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {lead.empresa ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {lead.cargo ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {renderClassificationBadge(lead.classificacao)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                        {lead.status_final}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-50 p-4 sm:p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dashboard de Leads
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Acompanhamento e listagem de leads em tempo real
            </p>
          </div>
          <div>
            <LogoutButton />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Carregando leads...
            </div>
          }
        >
          <LeadsData />
        </Suspense>
      </div>
    </main>
  );
}
