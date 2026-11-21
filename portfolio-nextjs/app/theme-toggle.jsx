"use client";

import { useEffect, useSyncExternalStore } from "react";

function getTheme() {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("portfolio-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function subscribe(callback) {
  window.addEventListener("portfolio-theme-change", callback);
  window.addEventListener("storage", callback);
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  preference.addEventListener("change", callback);
  return () => {
    window.removeEventListener("portfolio-theme-change", callback);
    window.removeEventListener("storage", callback);
    preference.removeEventListener("change", callback);
  };
}

function getServerTheme() { return "light"; }

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("portfolio-theme", next);
    window.dispatchEvent(new Event("portfolio-theme-change"));
  }

  return <button className={`theme-toggle ${theme === "dark" ? "is-dark" : ""}`} type="button" role="switch" aria-checked={theme === "dark"} onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
    <span className="theme-toggle-thumb" aria-hidden="true">{theme === "dark" ? "☾" : "☼"}</span>
  </button>;
}
