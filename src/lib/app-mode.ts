import { useEffect, useState } from "react";

const KEY = "vrumex-app-mode";

/** True when VRUMEX runs as the installed phone app (home-screen launch). */
export function detectAppMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("app") === "1") sessionStorage.setItem(KEY, "1");
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
    return standalone || sessionStorage.getItem(KEY) === "1";
  } catch { return false; }
}

export function useAppMode(): boolean {
  const [app, setApp] = useState(false);
  useEffect(() => { setApp(detectAppMode()); }, []);
  return app;
}
