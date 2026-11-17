import { z } from "zod";

const requiredTrimmedString = (field: string) =>
  z
    .string({
      error: () => `O campo '${field}' é obrigatório e deve ser texto.`,
    })
    .trim()
    .min(1, `O campo '${field}' é obrigatório.`)
    .max(200, `O campo '${field}' deve ter no máximo 200 caracteres.`);

export const leadFormSchema = z.object({
  nome: requiredTrimmedString("nome"),
  email: z
    .string({
      error: () => "O campo 'email' é obrigatório.",
    })
    .trim()
    .min(1, "O campo 'email' é obrigatório.")
    .max(200, "O campo 'email' deve ter no máximo 200 caracteres.")
    .email("Formato de email inválido."),
  telefone: requiredTrimmedString("telefone"),
  empresa: requiredTrimmedString("empresa"),
  cargo: requiredTrimmedString("cargo"),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const qualifiedLeadSchema = z.object({
  email: z
    .string({
      error: () => "O campo 'email' é obrigatório.",
    })
    .trim()
    .email("Formato de email inválido."),
  nome: requiredTrimmedString("nome"),
  telefone: requiredTrimmedString("telefone"),
  empresa: requiredTrimmedString("empresa"),
  cargo: requiredTrimmedString("cargo"),
  classificacao: z.enum(["quente", "morno", "frio"]).optional(),
  metodo_classificacao: z
    .string()
    .trim()
    .max(100, "O campo 'metodo_classificacao' deve ter no máximo 100 caracteres.")
    .optional(),
  status_final: z
    .string()
    .trim()
    .max(100, "O campo 'status_final' deve ter no máximo 100 caracteres.")
    .optional(),
  lead_id: z.string().uuid("O campo 'lead_id' deve ser um UUID válido.").optional(),
  detalhes: z.record(z.string(), z.unknown()).optional(),
});

export type QualifiedLeadInput = z.infer<typeof qualifiedLeadSchema>;
