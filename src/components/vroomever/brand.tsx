import { Link } from "@tanstack/react-router";
import mark from "@/assets/vrumever-logo.png";
import { cn } from "@/lib/utils";

/** Single VRUMEX lockup: the crescent-moon V mark forms the first letter of the name. */
export function Brand({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return <Link to="/" aria-label="VRUMEX home" className={cn("flex items-center", inverted && "text-primary-foreground")}>
    <img src={mark} alt="" width={256} height={256} className="size-9 shrink-0 object-contain" />
    {!compact && <span className="-ml-1"><strong className="block font-display text-lg leading-none tracking-wide">RUMEX</strong><small className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Discover • Connect • Trade</small></span>}
  </Link>;
}
