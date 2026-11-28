import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ paths: z.array(z.string().min(1).max(500)).max(100) });

/** Signs short-lived links only for media attached to live (approved, unexpired) listings. */
export const signListingMedia = createServerFn({ method: "POST" })
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data }) => {
    const paths = [...new Set(data.paths.filter((p) => !/^https?:|^\//.test(p)))];
    if (!paths.length) return {} as Record<string, string>;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nowIso = new Date().toISOString();
    const [imgs, vids] = await Promise.all([
      supabaseAdmin.from("products").select("images").eq("status", "active").overlaps("images", paths)
        .or(`listing_expires_at.is.null,listing_expires_at.gt.${nowIso}`),
      supabaseAdmin.from("products").select("video_url").eq("status", "active").in("video_url", paths)
        .or(`listing_expires_at.is.null,listing_expires_at.gt.${nowIso}`),
    ]);
    const allowed = new Set<string>();
    imgs.data?.forEach((r: any) => r.images?.forEach((p: string) => allowed.add(p)));
    vids.data?.forEach((r: any) => r.video_url && allowed.add(r.video_url));
    const ok = paths.filter((p) => allowed.has(p));
    if (!ok.length) return {} as Record<string, string>;
    const { data: signed } = await supabaseAdmin.storage.from("product-media").createSignedUrls(ok, 600);
    const out: Record<string, string> = {};
    signed?.forEach((s) => { if (s.path && s.signedUrl) out[s.path] = s.signedUrl; });
    return out;
  });
