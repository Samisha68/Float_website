const KEY = "float-docs-theme";

/** The theme class lives on <html> so an inline script can set it before first paint (see docs.html). */
export function applyStoredTheme() {
  try {
    const stored = localStorage.getItem(KEY);
    const dark = stored !== "light"; // dark by default; only an explicit choice of light overrides it
    document.documentElement.classList.toggle("dark", dark);
  } catch { /* Storage blocked: stay on the default theme. */ }
}

export function toggleTheme() {
  const dark = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", dark);
  try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch { /* Not persisted; still applied. */ }
}
