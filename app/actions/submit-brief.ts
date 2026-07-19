"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { Resend } from "resend";

/**
 * submitBrief — Server Action do form de contato (S11 · ULTRAGOAL §6-W4).
 *
 * Pipeline: honeypot → rate-limit por IP → Zod → Resend (e-mail) →
 * POST webhook n8n (→ Evolution API → WhatsApp). Env ausente NUNCA
 * bloqueia (Apêndice B): canal indisponível é pulado com log claro;
 * se NENHUM canal entregar, o lead é logado no server (Vercel logs) e
 * o form mostra a mensagem de erro OFICIAL do JSON (que já aponta o
 * mailto contato@sattiai.com como saída).
 *
 * O retorno é apenas um status tipado — as strings visíveis são
 * resolvidas no client a partir de content/home.*.json (copy-law L1).
 */

export interface SubmitBriefState {
  status: "idle" | "success" | "error" | "invalid";
  /** Campos reprovados na validação (para marcar .isError por campo). */
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
}

const BriefSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  budget: z.string().trim().max(120).optional().or(z.literal("")),
});

/* Rate-limit simples por IP (melhor esforço em serverless: vale por
   instância quente — suficiente contra spam casual; §6-W4). */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function submitBrief(
  _prev: SubmitBriefState,
  formData: FormData,
): Promise<SubmitBriefState> {
  // Honeypot: campo invisível "website" — bot preenche, humano não.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success" }; // silêncio proposital para o bot
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
  if (rateLimited(ip)) {
    return { status: "error" };
  }

  const parsed = BriefSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    message: formData.get("message"),
    budget: formData.get("budget"),
  });

  if (!parsed.success) {
    const fieldErrors: SubmitBriefState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "email" || field === "message") {
        fieldErrors[field] = issue.code;
      }
    }
    return { status: "invalid", fieldErrors };
  }

  const brief = parsed.data;
  let delivered = false;

  // Canal 1 — e-mail via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (resendKey && from && to) {
    try {
      const resend = new Resend(resendKey);
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: brief.email,
        subject: `[sattiai.com] Novo brief — ${brief.name}`,
        text: [
          `Nome: ${brief.name}`,
          `E-mail: ${brief.email}`,
          brief.company ? `Empresa: ${brief.company}` : null,
          brief.budget ? `Faixa de investimento: ${brief.budget}` : null,
          "",
          brief.message,
        ]
          .filter((line): line is string => line !== null)
          .join("\n"),
      });
      if (error) {
        console.error("[submitBrief] Resend falhou:", error);
      } else {
        delivered = true;
      }
    } catch (err) {
      console.error("[submitBrief] Resend exception:", err);
    }
  } else {
    console.warn(
      "[submitBrief] Resend não configurado (RESEND_API_KEY/CONTACT_*_EMAIL) — canal pulado.",
    );
  }

  // Canal 2 — webhook n8n (→ Evolution API → WhatsApp)
  const webhook = process.env.N8N_LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "sattiai.com",
          ...brief,
          receivedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        delivered = true;
      } else {
        console.error(`[submitBrief] n8n webhook HTTP ${res.status}`);
      }
    } catch (err) {
      console.error("[submitBrief] n8n webhook exception:", err);
    }
  } else {
    console.warn(
      "[submitBrief] N8N_LEAD_WEBHOOK_URL não configurada — canal pulado.",
    );
  }

  if (!delivered) {
    // Nenhum canal entregou: registrar o lead nos logs do server para
    // não perder o contato (Apêndice B) e devolver o erro oficial.
    console.error(
      "[submitBrief] LEAD NÃO ENTREGUE — registro de contingência:",
      JSON.stringify({ ...brief, ip }),
    );
    return { status: "error" };
  }

  return { status: "success" };
}
