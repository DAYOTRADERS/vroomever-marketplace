import { Link } from "@tanstack/react-router";
import logo from "@/assets/vrumex-logo-flat.webp";
import { cn } from "@/lib/utils";

/** Single VRUMEX logo: arched 3D varsity lettering with the tagline beneath. */
export function Brand({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return (
    <Link to="/" aria-label="VRUMEX home" className={cn("-mt-1 flex flex-col items-start sm:mt-0", inverted && "text-primary-foreground")}>
      <img src={logo} alt="VRUMEX" width={600} height={205} className={cn("w-auto shrink-0 object-contain", compact ? "h-6" : "h-7 sm:h-8")} />
      <span className={cn("font-display font-extrabold uppercase leading-none tracking-[0.28em] text-foreground", compact ? "mt-1 text-[7px]" : "mt-1.5 text-[8px] sm:text-[9px]", inverted && "text-primary-foreground")}>
        Discover • Connect • Trade
      </span>
    </Link>
  );
}
