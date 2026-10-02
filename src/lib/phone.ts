export const countryCodes = [
  { code: "254", label: "🇰🇪 Kenya +254" },
  { code: "255", label: "🇹🇿 Tanzania +255" },
  { code: "256", label: "🇺🇬 Uganda +256" },
  { code: "250", label: "🇷🇼 Rwanda +250" },
  { code: "257", label: "🇧🇮 Burundi +257" },
  { code: "251", label: "🇪🇹 Ethiopia +251" },
  { code: "211", label: "🇸🇸 South Sudan +211" },
  { code: "252", label: "🇸🇴 Somalia +252" },
  { code: "27", label: "🇿🇦 South Africa +27" },
  { code: "234", label: "🇳🇬 Nigeria +234" },
  { code: "971", label: "🇦🇪 UAE +971" },
  { code: "44", label: "🇬🇧 UK +44" },
  { code: "1", label: "🇺🇸 USA/Canada +1" },
] as const;

/** Combines a country code and local number into digits-only international form, or null if invalid. */
export function buildPhone(code: string, local: string): string | null {
  const digits = local.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length < 6 || digits.length > 12) return null;
  return code + digits;
}

/** Normalises stored phone values (legacy local "07…" numbers default to Kenya). */
export function toIntl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (!d) return null;
  return d.startsWith("0") ? "254" + d.slice(1) : d;
}

export const whatsappLink = (intl: string, text: string) => `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
export const callLink = (intl: string) => `tel:+${intl}`;
