import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TOPICS = ["account", "listing", "payment", "safety", "technical", "other"] as const;
const URGENCY = ["low", "medium", "high", "urgent"] as const;

/**
 * Uses AI to summarise a support message, classify topic and urgency, and draft a reply for admins.
 * Public on purpose (signed-out visitors can contact support) — it only fills in messages that have
 * not been analysed yet, so it cannot overwrite or read anything else.
 */
export const analyzeSupportMessage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: msg, error } = await supabaseAdmin
      .from("support_messages")
      .select("id,name,topic,message,ai_summary")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !msg) return { ok: false as const, error: "Message not found." };
    if (msg.ai_summary) return { ok: true as const };

    const { generateGatewayText } = await import("./ai-gateway.server");
    let raw: string;
    try {
      raw = await generateGatewayText([
        {
          role: "system",
          content:
            `You triage support messages for VRUMEVER, a Kenyan online marketplace. Reply with ONLY a JSON object, no markdown: ` +
            `{"summary": one or two plain sentences, "topic": one of ${JSON.stringify(TOPICS)}, "urgency": one of ${JSON.stringify(URGENCY)}, ` +
            `"suggested_reply": a polite, helpful reply of 40-120 words an admin could send, addressed to the user by first name, signed "VRUMEVER Support"}. ` +
            `Urgency: urgent = fraud, threats, money lost or account takeover; high = cannot use the service; medium = problem with a workaround; low = questions or feedback. Never promise refunds.`,
        },
        { role: "user", content: `Name: ${msg.name}\nUser-selected topic: ${msg.topic}\nMessage:\n${msg.message}` },
      ]);
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "AI unavailable." };
    }
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = z
      .object({ summary: z.string(), topic: z.string(), urgency: z.string(), suggested_reply: z.string() })
      .safeParse((() => { try { return JSON.parse(json); } catch { return null; } })());
    if (!parsed.success) return { ok: false as const, error: "AI returned an unreadable result." };
    const p = parsed.data;
    await supabaseAdmin
      .from("support_messages")
      .update({
        ai_summary: p.summary.slice(0, 600),
        ai_topic: (TOPICS as readonly string[]).includes(p.topic) ? p.topic : "other",
        ai_urgency: (URGENCY as readonly string[]).includes(p.urgency) ? p.urgency : "medium",
        ai_suggested_reply: p.suggested_reply.slice(0, 2000),
      })
      .eq("id", msg.id)
      .is("ai_summary", null);
    return { ok: true as const };
  });
