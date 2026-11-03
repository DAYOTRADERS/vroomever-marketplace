import { Link } from "@tanstack/react-router";
import logo from "@/assets/vrumex-logo-arched.webp";
import { cn } from "@/lib/utils";

/** Single VRUMEX logo: arched 3D varsity lettering with the tagline beneath. */
export function Brand({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return (
    <Link to="/" aria-label="VRUMEX home" className={cn("flex flex-col items-center", inverted && "text-primary-foreground")}>
      <img src={logo} alt="VRUMEX" width={600} height={205} className={cn("w-auto shrink-0 object-contain", compact ? "h-6" : "h-8")} />
      <span className={cn("font-display font-extrabold uppercase leading-none tracking-[0.28em] text-foreground", compact ? "mt-0.5 text-[6px]" : "mt-0.5 text-[7px]", inverted && "text-primary-foreground")}>
        Discover • Connect • Trade
      </span>
    </Link>
  );
}
