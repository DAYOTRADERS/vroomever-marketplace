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

/** Turns stored paths (or full URLs) into viewable links. */
export async function mediaUrls(paths: string[]): Promise<string[]> {
  const stored = paths.filter((p) => p && !/^https?:|^\//.test(p));
  const map = new Map<string, string>();
  if (stored.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(stored, 60 * 60 * 6);
    data?.forEach((d) => d.path && d.signedUrl && map.set(d.path, d.signedUrl));
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
