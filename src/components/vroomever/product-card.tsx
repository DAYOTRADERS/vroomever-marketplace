import { Link } from "@tanstack/react-router";
import { BadgeCheck, Heart, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatKsh } from "@/data/marketplace";
import { Button } from "@/components/ui/button";
import type { CardProduct } from "@/types/marketplace";

export function ProductCard({ product }: { product: CardProduct }) {
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      if (alive) setUserId(session.user.id);
      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", session.user.id)
        .eq("product_id", product.id)
        .maybeSingle();
      if (alive) setLiked(!!data);
    })();
    return () => {
      alive = false;
    };
  }, [product.id]);

  const toggleFavorite = async () => {
    if (!userId || busy) return;
    setBusy(true);
    if (liked) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", product.id);
      setLiked(false);
    } else {
      await supabase.from("favorites").insert({ user_id: userId, product_id: product.id });
      setLiked(true);
    }
    setBusy(false);
  };

  return (
    <article className="group overflow-hidden rounded-card border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link to="/product/$id" params={{ id: product.id }}>
          <img
            src={product.image}
            alt={product.title}
            width={1200}
            height={900}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        {product.vip && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-vip px-2.5 py-1 text-xs font-bold text-vip-foreground shadow">
            <Sparkles className="size-3" /> VIP
          </span>
        )}
        <Button
          variant="glass"
          size="icon"
          className="absolute right-3 top-3 rounded-full"
          onClick={() => void toggleFavorite()}
          disabled={busy}
          aria-label="Favorite"
        >
          <Heart className={liked ? "fill-current text-destructive" : ""} />
        </Button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-primary">{product.condition ?? ""}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {product.location ?? ""}
          </span>
        </div>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="mt-2 block font-semibold leading-snug hover:text-primary"
        >
          {product.title}
        </Link>
        <div className="mt-3 flex items-end justify-between">
          <strong className="font-display text-lg">{formatKsh(product.price)}</strong>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <BadgeCheck className="size-4 text-primary" />
            {product.seller}
          </span>
        </div>
      </div>
    </article>
  );
}
