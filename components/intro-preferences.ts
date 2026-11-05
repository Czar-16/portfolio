export const INTRO_STORAGE_KEY = "czar-portfolio-intro-v1";
export type IntroPreferences = { color: "green" | "red" | "blue" | "yellow"; motion: boolean };
const INTRO_COLORS = ["green", "red", "blue", "yellow"] as const;
type SavedIntro = IntroPreferences & { completed: true };
let fallback: SavedIntro | null = null;
let storageUnavailable = false;

export function readIntroPreferences(): SavedIntro | null {
  if (storageUnavailable) return fallback;
  try {
    const raw = localStorage.getItem(INTRO_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (value?.completed === true && INTRO_COLORS.includes(value.color) && typeof value.motion === "boolean") return value;
  } catch { return fallback; }
  return fallback;
}

export function completeIntro(preferences: IntroPreferences) {
  fallback = { completed: true, color: preferences.color, motion: preferences.motion };
  try { localStorage.setItem(INTRO_STORAGE_KEY, JSON.stringify(fallback)); }
  catch { storageUnavailable = true; }
}

// Restore motion before first paint. The color belongs only to the intro dialog.
export const INTRO_BOOTSTRAP = `(()=>{delete document.documentElement.dataset.accent;try{const p=JSON.parse(localStorage.getItem("${INTRO_STORAGE_KEY}"));if(p?.completed===true&&${JSON.stringify(INTRO_COLORS)}.includes(p.color)&&typeof p.motion==="boolean"){document.documentElement.dataset.motion=p.motion?"on":"off"}}catch{}})()`;
