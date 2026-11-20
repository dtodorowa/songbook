/**
 * Theme store — persists 'light' | 'dark' in localStorage
 * and applies `data-theme` attribute to <html>.
 */

type Theme = "light" | "dark";

function createThemeState() {
  let current = $state<Theme>("dark");

  function apply(t: Theme) {
    current = t;
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", t === "dark");
      localStorage.setItem("theme", t);
    }
  }

  function init() {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("theme") as Theme | null;
    // Dark is the house look now, so a first visit lands there whatever the OS
    // prefers. Light is still a real theme, one toggle away, and once someone
    // chooses it that choice sticks.
    apply(saved === "light" ? "light" : "dark");
  }

  function toggle() {
    apply(current === "dark" ? "light" : "dark");
  }

  return {
    get current() {
      return current;
    },
    init,
    toggle,
  };
}

export const themeState = createThemeState();
