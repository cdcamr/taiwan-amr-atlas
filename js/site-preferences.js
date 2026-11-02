"use strict";
(() => {
  const LANGUAGE_KEY = "taiwan-amr-platform-language";
  const THEME_KEY = "taiwan-amr-platform-theme";
  const LEGACY_NEWS_THEME_KEY = "amr-news-theme";
  const LANGUAGES = ["zh", "en", "ja"];
  const THEMES = ["light", "dark"];
  const read = key => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) {}
  };
  const cleanLanguage = value => LANGUAGES.includes(value) ? value : "zh";
  const cleanTheme = value => THEMES.includes(value) ? value : "dark";
  let language = cleanLanguage(read(LANGUAGE_KEY));
  const savedTheme = read(THEME_KEY);
  const legacyTheme = read(LEGACY_NEWS_THEME_KEY);
  let theme = cleanTheme(THEMES.includes(savedTheme) ? savedTheme : legacyTheme);

  const applyLanguage = (value, save = true) => {
    language = cleanLanguage(value);
    document.documentElement.lang = language === "zh" ? "zh-Hant" : language;
    if (save) write(LANGUAGE_KEY, language);
    return language;
  };
  const applyTheme = (value, save = true) => {
    theme = cleanTheme(value);
    document.body.classList.toggle("light", theme === "light");
    if (save) write(THEME_KEY, theme);
    return theme;
  };
  // Restore before any visible content is rendered.
  applyLanguage(language, false);
  applyTheme(theme, false);
  if (!THEMES.includes(savedTheme) && THEMES.includes(legacyTheme)) {
    write(THEME_KEY, theme); // Migrate the old News-only theme once.
  }
  window.AMRSitePreferences = Object.freeze({
    getLanguage: () => language,
    setLanguage: value => applyLanguage(value),
    getTheme: () => theme,
    setTheme: value => applyTheme(value),
    toggleTheme: () => applyTheme(theme === "light" ? "dark" : "light")
  });
  window.addEventListener("storage", event => {
    if (event.key === LANGUAGE_KEY) applyLanguage(event.newValue, false);
    if (event.key === THEME_KEY) applyTheme(event.newValue, false);
  });
})();
