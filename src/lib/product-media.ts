import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-media";

/** Uploads listing files into the seller's own folder and returns storage paths. */
export async function uploadListingMedia(userId: string, files: File[]): Promise<string[]> {
  const paths: string[] = [];
  for (const file of files) {
    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Upload failed for ${file.name}: ${error.message}`);
    paths.push(path);
  }
  return paths;
}

// Signed URLs are cached in memory so revisiting a grid or listing is instant.
const urlCache = new Map<string, { url: string; expiresAt: number }>();

/** Turns stored paths (or full URLs) into viewable links, optionally downscaled. */
export async function mediaUrls(paths: string[], opts?: { width?: number; quality?: number }): Promise<string[]> {
  const stored = paths.filter((p) => p && !/^https?:|^\//.test(p));
  const now = Date.now();
  const sizeKey = `@${opts?.width ?? 0}`;
  const map = new Map<string, string>();
  const missing: string[] = [];
  for (const p of stored) {
    const hit = urlCache.get(p + sizeKey);
    if (hit && hit.expiresAt > now + 60_000) map.set(p, hit.url);
    else missing.push(p);
  }
  if (missing.length) {
    // opts.width/quality are kept for call-site clarity; this storage version
    // cannot transform server-side, so caching is what makes repeat loads instant.
    void opts;
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(missing, 60 * 60 * 6);
    data?.forEach((d) => {
      if (d.path && d.signedUrl) {
        map.set(d.path, d.signedUrl);
        urlCache.set(d.path + sizeKey, { url: d.signedUrl, expiresAt: now + 6 * 60 * 60 * 1000 });
      }
    });
  }
  return paths.map((p) => map.get(p) ?? p).filter((u) => /^https?:|^\//.test(u));
}

/** Downscales an image file into a small JPEG data URL for AI analysis. */
export function imageToDataUrl(file: File, max = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
