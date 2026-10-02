import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  title: z.string().trim().min(2).max(160),
  category: z.string().max(80),
  subcategory: z.string().max(80).optional().default(""),
  condition: z.string().max(40),
  price: z.string().max(20),
  location: z.string().max(120),
  notes: z.string().max(2000).optional().default(""),
  photos: z.array(z.string().startsWith("data:image/").max(1_500_000)).max(3).default([]),
});

export const generateListingDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const { generateGatewayText } = await import("./ai-gateway.server");
    const facts = [
      `Title: ${data.title}`,
      `Category: ${data.category}${data.subcategory ? " / " + data.subcategory : ""}`,
      `Condition: ${data.condition}`,
      data.price ? `Price: KSh ${data.price}` : "",
      data.location ? `Location: ${data.location}, Kenya` : "",
      data.notes ? `Seller notes: ${data.notes}` : "",
    ].filter(Boolean).join("\n");
    const text = await generateGatewayText([
      {
        role: "system",
        content:
          "You write clear, honest, buyer-friendly product descriptions for a Kenyan online marketplace. Use only facts from the seller's details and what is clearly visible in the photos. Never invent specs, warranties or history. Write 90-160 words: a short opening sentence, then 3-6 bullet points of key features or condition notes, then one line inviting buyers to contact the seller. Plain text only, bullets start with '• '. No headings, no markdown.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: facts },
          ...data.photos.map((p) => ({ type: "image" as const, image: p })),
        ],
      },
    ]);
    return { description: text };
  });
