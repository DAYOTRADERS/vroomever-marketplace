import { useEffect, useState } from "react";

const themeKey = "vrumex-theme";
export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try { localStorage.setItem(themeKey, dark ? "dark" : "light"); } catch { /* Storage may be disabled. */ }
  window.dispatchEvent(new Event("vrumex-theme-change"));
}

/** All appearance controls share one persisted document theme. */
export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    const storage = (event: StorageEvent) => {
      if (event.key === themeKey) {
        document.documentElement.classList.toggle("dark", event.newValue === "dark");
        sync();
      }
    };
    window.addEventListener("vrumex-theme-change", sync);
    window.addEventListener("storage", storage);
    return () => { window.removeEventListener("vrumex-theme-change", sync); window.removeEventListener("storage", storage); };
  }, []);
  return { dark, toggleTheme: () => applyTheme(!document.documentElement.classList.contains("dark")) };
}