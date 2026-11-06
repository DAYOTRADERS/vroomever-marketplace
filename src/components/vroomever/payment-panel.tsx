import { useState } from "react";
import { CreditCard, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Method = "mpesa" | "card";
type CardBrand = "visa" | "mastercard" | "amex" | "unknown";

export function MpesaLogo({ className = "h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 44" className={className} role="img" aria-label="M-Pesa">
      <rect x="1" y="4" width="24" height="36" rx="5" fill="#4CAF35" />
      <rect x="5" y="9" width="16" height="22" rx="2" fill="#fff" />
      <circle cx="13" cy="35" r="2" fill="#fff" />
      <path d="M8 24l4-7 3 4 3-5" stroke="#E31B23" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="32" y="31" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="22" fill="#4CAF35">M</text>
      <rect x="53" y="20" width="9" height="4" fill="#E31B23" />
      <text x="64" y="31" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="22" fill="#4CAF35">PESA</text>
    </svg>
  );
}
const VisaLogo = () => <svg viewBox="0 0 64 22" className="h-6" aria-label="Visa"><text x="2" y="19" fontFamily="Arial Black, Arial" fontStyle="italic" fontWeight="900" fontSize="21" fill="#1A1F71">VISA</text></svg>;
const MastercardLogo = () => <svg viewBox="0 0 48 30" className="h-7" aria-label="Mastercard"><circle cx="17" cy="15" r="13" fill="#EB001B" /><circle cx="31" cy="15" r="13" fill="#F79E1B" /><path d="M24 4.2a13 13 0 0 1 0 21.6 13 13 0 0 1 0-21.6z" fill="#FF5F00" /></svg>;
const AmexLogo = () => <svg viewBox="0 0 48 30" className="h-7" aria-label="American Express"><rect width="48" height="30" rx="3" fill="#2E77BC" /><text x="24" y="13" textAnchor="middle" fontFamily="Arial" fontWeight="900" fontSize="8" fill="#fff">AMERICAN</text><text x="24" y="23" textAnchor="middle" fontFamily="Arial" fontWeight="900" fontSize="8" fill="#fff">EXPRESS</text></svg>;

const detectBrand = (n: string): CardBrand => /^4/.test(n) ? "visa" : /^(5[1-5]|2[2-7])/.test(n) ? "mastercard" : /^3[47]/.test(n) ? "amex" : "unknown";
const luhn = (n: string) => { let sum = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = Number(n[i] ?? 0); if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; } return n.length >= 13 && sum % 10 === 0; };
const formatNumber = (raw: string, brand: CardBrand) => { const d = raw.replace(/\D/g, "").slice(0, brand === "amex" ? 15 : 16); return brand === "amex" ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")) : d.replace(/(\d{4})(?=\d)/g, "$1 "); };
const validExpiry = (v: string) => { const m = /^(\d{2})\/(\d{2})$/.exec(v); if (!m) return false; const mm = Number(m[1]), yy = 2000 + Number(m[2]); if (mm < 1 || mm > 12) return false; const now = new Date(); return yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1); };

export function PaymentPanel({ onResult, amountLabel, title }: { onResult?: (success: boolean, method: Method) => void; amountLabel?: string; title?: string } = {}) {
  const [tab, setTab] = useState<Method>("mpesa");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "", email: "", address: "", city: "", postal: "", country: "Kenya" });
  const digits = card.number.replace(/\D/g, "");
  const brand = detectBrand(digits);
  const set = (k: keyof typeof card, v: string) => setCard((c) => ({ ...c, [k]: v }));

  const simulate = (method: Method) => { setError(""); setState("loading"); onResult?.(false, method); setTimeout(() => { setState("success"); onResult?.(true, method); }, 1000); };
  const payMpesa = () => { const p = phone.replace(/\s/g, ""); if (!/^(?:\+?254|0)(7|1)\d{8}$/.test(p)) return setError("Enter a valid Safaricom number, e.g. 0712 345 678."); simulate("mpesa"); };
  const payCard = () => {
    if (!luhn(digits)) return setError("Card number is not valid.");
    if (!validExpiry(card.expiry)) return setError("Expiry date is invalid or has passed.");
    if (!new RegExp(brand === "amex" ? "^\\d{4}$" : "^\\d{3}$").test(card.cvv)) return setError(brand === "amex" ? "CVV must be 4 digits." : "CVV must be 3 digits.");
    if (card.name.trim().length < 3) return setError("Enter the full name as shown on the card.");
    if (!/^\S+@\S+\.\S+$/.test(card.email)) return setError("Enter a valid email for the receipt.");
    if (!card.address.trim() || !card.city.trim() || !/^[A-Za-z0-9 -]{3,10}$/.test(card.postal)) return setError("Complete your billing address, city and postal code.");
    simulate("card");
  };

  const tabBtn = (m: Method, Icon: typeof Smartphone, label: string) => (
    <button type="button" onClick={() => { setTab(m); setError(""); }} className={`flex flex-1 flex-col items-center gap-1 border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === m ? "border-brand-bright bg-muted text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`} aria-pressed={tab === m}><Icon className="size-6" />{label}</button>
  );

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-card border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 text-center">
        <p className="font-display text-lg font-bold">{title ?? "Complete payment"}</p>
        {amountLabel && <p className="text-sm font-semibold text-muted-foreground">{amountLabel}</p>}
        <p className="mt-1 text-[11px] text-muted-foreground">Simulation only — no real payment will be processed.</p>
      </div>
      <div className="flex border-b border-border">{tabBtn("mpesa", Smartphone, "M-Pesa")}{tabBtn("card", CreditCard, "Card")}</div>
      <div className="space-y-4 p-5">
        {tab === "mpesa" ? <>
          <div className="flex justify-center py-2"><MpesaLogo className="h-11" /></div>
          <label className="block text-sm font-medium">M-Pesa phone number<Input className="mt-1.5" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, "").slice(0, 16))} /></label>
          <p className="text-xs text-muted-foreground">You'll get a prompt on your phone. Enter your M-Pesa PIN there — never share it with anyone.</p>
          <Button className="w-full" disabled={state === "loading"} onClick={payMpesa}>{state === "loading" ? "Sending prompt…" : "Send M-Pesa prompt"}</Button>
        </> : <>
          <div className="flex items-center justify-center gap-5 py-1"><span className={brand !== "unknown" && brand !== "mastercard" ? "opacity-30" : ""}><MastercardLogo /></span><span className={brand !== "unknown" && brand !== "visa" ? "opacity-30" : ""}><VisaLogo /></span><span className={brand !== "unknown" && brand !== "amex" ? "opacity-30" : ""}><AmexLogo /></span></div>
          <div className="overflow-hidden rounded-md border border-input">
            <Input className="rounded-none border-0 shadow-none focus-visible:ring-0" inputMode="numeric" autoComplete="cc-number" placeholder="XXXX XXXX XXXX XXXX" value={card.number} onChange={(e) => set("number", formatNumber(e.target.value, detectBrand(e.target.value.replace(/\D/g, ""))))} aria-label="Card number" />
            <div className="grid grid-cols-2 border-t border-input">
              <Input className="rounded-none border-0 border-r border-input shadow-none focus-visible:ring-0" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); set("expiry", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d); }} aria-label="Expiry date" />
              <Input className="rounded-none border-0 shadow-none focus-visible:ring-0" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder={brand === "amex" ? "CVV (4)" : "CVV"} value={card.cvv} onChange={(e) => set("cvv", e.target.value.replace(/\D/g, "").slice(0, brand === "amex" ? 4 : 3))} aria-label="Security code" />
            </div>
          </div>
          <label className="block text-sm font-medium">Name on card<Input className="mt-1.5" autoComplete="cc-name" placeholder="Full name as on card" value={card.name} onChange={(e) => set("name", e.target.value.replace(/[^A-Za-z .'-]/g, "").slice(0, 60))} /></label>
          <label className="block text-sm font-medium">Email for receipt<Input className="mt-1.5" type="email" autoComplete="email" placeholder="you@example.com" value={card.email} onChange={(e) => set("email", e.target.value.slice(0, 120))} /></label>
          <label className="block text-sm font-medium">Billing address<Input className="mt-1.5" autoComplete="address-line1" placeholder="Street, building, apartment" value={card.address} onChange={(e) => set("address", e.target.value.slice(0, 120))} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">City<Input className="mt-1.5" autoComplete="address-level2" placeholder="Nairobi" value={card.city} onChange={(e) => set("city", e.target.value.slice(0, 60))} /></label>
            <label className="block text-sm font-medium">Postal code<Input className="mt-1.5" autoComplete="postal-code" placeholder="00100" value={card.postal} onChange={(e) => set("postal", e.target.value.slice(0, 10))} /></label>
          </div>
          <label className="block text-sm font-medium">Country<Input className="mt-1.5" autoComplete="country-name" value={card.country} onChange={(e) => set("country", e.target.value.slice(0, 60))} /></label>
          <Button className="w-full" disabled={state === "loading"} onClick={payCard}><Lock />{state === "loading" ? "Processing…" : `Pay${amountLabel ? ` ${amountLabel}` : ""}`}</Button>
        </>}
        {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
        {state === "success" && <p className="rounded-md bg-secondary p-3 text-sm text-primary">Payment simulation successful. Your plan is ready.</p>}
        <div className="flex items-start gap-2 pt-1 text-xs text-muted-foreground"><ShieldCheck className="size-5 shrink-0 text-brand-bright" /><span>Your payment details are encrypted, verified with 3-D Secure and never shared with third parties. Card details are not stored.</span></div>
      </div>
    </div>
  );
}
