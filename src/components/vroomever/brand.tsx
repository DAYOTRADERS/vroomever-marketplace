import { Link } from "@tanstack/react-router";
import mark from "@/assets/vroomever-mark.png";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return <Link to="/" className={cn("flex items-center gap-2.5", inverted && "text-primary-foreground")}>
    <img src={mark} alt="Vroomever" width={1024} height={1024} className="size-9 object-contain" />
    {!compact && <span><strong className="block font-display text-lg leading-none tracking-wide">VROOMEVER</strong><small className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Discover • Connect • Trade</small></span>}
  </Link>;
}
