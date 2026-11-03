import { Link } from "@tanstack/react-router";
import logo from "@/assets/vrumex-logo-arched.webp";
import { cn } from "@/lib/utils";

/** Single VRUMEX logo: arched 3D varsity lettering with the tagline beneath. */
export function Brand({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return <Link to="/" aria-label="VRUMEX home" className={cn("flex items-center", inverted && "text-primary-foreground")}>
    <img src={logo} alt="VRUMEX — Discover, Connect, Trade" width={600} height={238} className={cn("w-auto shrink-0 object-contain", compact ? "h-8" : "h-11")} />
  </Link>;
}
