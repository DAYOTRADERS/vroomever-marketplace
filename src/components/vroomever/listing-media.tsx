import { useEffect, useState } from "react";
import { mediaUrls } from "@/lib/product-media";

/** Shows the photos and video a seller uploaded, for admin review and the seller's own list. */
export function ListingMedia({ images, video }: { images: string[] | null; video: string | null }) {
  const [imgs, setImgs] = useState<string[]>([]);
  const [vid, setVid] = useState("");
  const key = (images ?? []).join("|") + "#" + (video ?? "");
  useEffect(() => {
    let alive = true;
    void mediaUrls(images ?? []).then((u) => alive && setImgs(u.filter(Boolean)));
    if (video) void mediaUrls([video]).then((u) => alive && setVid(u[0] ?? ""));
    else setVid("");
    return () => { alive = false; };
  }, [key]);
  if (!images?.length && !video) return <p className="text-xs text-muted-foreground">No photos or video uploaded.</p>;
  return (
    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {imgs.map((u, i) => (
        <a key={u} href={u} target="_blank" rel="noreferrer" className="shrink-0">
          <img src={u} alt={`Photo ${i + 1}`} loading="lazy" className="size-20 rounded-md border border-border object-cover" />
        </a>
      ))}
      {vid && <video src={vid} controls preload="metadata" className="h-20 w-36 shrink-0 rounded-md border border-border bg-muted object-cover" />}
    </div>
  );
}
