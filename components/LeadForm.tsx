"use client";

import { useState, type FormEvent } from "react";

interface FormState {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
}

const initialFormState: FormState = {
  nome: "",
  email: "",
  telefone: "",
  empresa: "",
  cargo: "",
};

export default function LeadForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle" });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.ok) {
        setForm(initialFormState);
        setStatus({
          type: "success",
          message: "Contato enviado com sucesso! Em breve entraremos em contato.",
        });
      } else {
        setStatus({
          type: "error",
          message:
            data?.error ||
            "Não foi possível enviar seu contato. Tente novamente.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Não foi possível enviar seu contato. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Cadastro de Interesse
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Preencha seus dados corporativos para falar com nossa equipe.
        </p>
      </div>

      <div>
        <label
          htmlFor="nome"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Nome completo
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          required
          maxLength={200}
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          E-mail corporativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={200}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label
          htmlFor="telefone"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Telefone
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          required
          maxLength={200}
          value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label
          htmlFor="empresa"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Empresa
        </label>
        <input
          id="empresa"
          name="empresa"
          type="text"
          required
          maxLength={200}
          value={form.empresa}
          onChange={(e) => setForm({ ...form, empresa: e.target.value })}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label
          htmlFor="cargo"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Cargo
        </label>
        <input
          id="cargo"
          name="cargo"
          type="text"
          required
          maxLength={200}
          value={form.cargo}
          onChange={(e) => setForm({ ...form, cargo: e.target.value })}
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      {status.type === "success" && (
        <div
          role="status"
          className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
        >
          {status.message}
        </div>
      )}

      {status.type === "error" && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-300"
        >
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Enviando..." : "Enviar contato"}
      </button>
    </form>
  );
}
