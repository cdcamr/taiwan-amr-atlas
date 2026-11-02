"use strict";
(() => {
  const TITLES = Object.freeze({
    zh: "防疫一體抗生素抗藥性監測視覺化整合平臺",
    en: "Integrated One Health Antimicrobial Resistance Surveillance and Visualization Platform",
    ja: "ワンヘルス薬剤耐性（AMR）サーベイランス・可視化統合プラットフォーム"
  });
  const page = location.pathname.split("/").pop() || "index.html";
  const modules = {
    "news.html": "News & Events",
    "news-editor.html": "News & Events · 內容管理",
    "dataset-admin.html": "資料集版本管理",
    "data-studio.html": "監測資料管理",
    "ar-explorer.html": "AR Explorer",
    "au-explorer.html": "AU Explorer",
    "hai-explorer.html": "HAI Explorer",
    "one-health-lab.html": "One Health Lab",
    "antibiogram.html": "Antibiogram"
  };
  const preferences = window.AMRSitePreferences;
  const storeKey = "taiwan-amr-platform-language";
  const themeKey = "taiwan-amr-platform-theme";
  let saved = preferences ? preferences.getLanguage() : "zh";
  if (!preferences) {
    try { const value = localStorage.getItem(storeKey); if (Object.hasOwn(TITLES, value)) saved = value; } catch (_) {}
  }
  const native = document.getElementById("lang");
  const selector = native || document.createElement("select");
  if (!native) {
    selector.id = "siteLanguage";
    selector.setAttribute("aria-label", "平臺名稱語言 / Platform title language");
    [["zh","繁體中文"],["en","English"],["ja","日本語"]].forEach(([value,label]) => {
      const option = document.createElement("option");
      option.value = value; option.textContent = label; selector.append(option);
    });
    const container = document.querySelector("header nav")
      || document.querySelector("header .controls")
      || document.querySelector("header .row")
      || document.querySelector("header .flex")
      || document.querySelector("main > .bar")
      || document.querySelector("header")
      || document.body;
    container.append(selector);
  }
  const brand = document.querySelector("header .logo,header .brand,header > strong");
  const style = document.createElement("style");
  style.textContent = ".atlas-platform-brand{display:flex;align-items:center;flex-wrap:wrap;gap:4px 9px;font-size:clamp(13px,1.35vw,19px)!important;line-height:1.5;min-width:0;max-width:min(100%,970px);white-space:normal}.atlas-platform-name{font-weight:800;overflow-wrap:anywhere;color:inherit}.atlas-platform-symbol{color:var(--accent,var(--green,var(--a,#70dca0)))}.atlas-platform-module{font-size:12px;font-weight:500;opacity:.75;white-space:nowrap}#siteLanguage,#siteTheme{max-width:165px;font-size:13px;padding:7px 9px;background:var(--panel,var(--bg,#10291e));color:var(--text,var(--fg,#ebfcf0));border:1px solid var(--border,var(--line,#315843));border-radius:8px}body.light #siteLanguage{color:#163b28}";
  document.head.append(style);
  if (brand) {
    brand.classList.add("atlas-platform-brand");
    const symbol = document.createElement("span");symbol.className="atlas-platform-symbol";symbol.textContent="◈";
    const title = document.createElement("span");title.className="atlas-platform-name";
    brand.replaceChildren(symbol,title);
    if (modules[page]) {
      const module = document.createElement("small");module.className="atlas-platform-module";module.textContent="/ "+modules[page];
      brand.append(module);
    }
  }
  const update = lang => {
    const code = Object.hasOwn(TITLES,lang)?lang:"zh";
    document.documentElement.lang = code === "zh" ? "zh-Hant" : code;
    if (brand) brand.querySelector(".atlas-platform-name").textContent=TITLES[code];
    if (page === "antibiogram.html") {
      const link = document.querySelector("main > .bar a[href='./']");
      if (link) link.textContent = "← "+TITLES[code];
    }
    document.title = (modules[page] ? modules[page]+"｜" : "")+TITLES[code];
    if (preferences) preferences.setLanguage(code);
    else { try { localStorage.setItem(storeKey,code); } catch (_) {} }
    renderThemeControl();
  };
  // Every module uses the same light/dark preference. Add a control to pages
  // without one (such as the News editor).
  let themeButton = document.getElementById("theme") || document.getElementById("themeToggle");
  if (!themeButton) {
    themeButton = document.createElement("button");
    themeButton.type = "button";
    themeButton.id = "siteTheme";
    const holder = document.querySelector("header nav")
      || document.querySelector("header .controls")
      || document.querySelector("header .row")
      || document.querySelector("header .flex")
      || document.querySelector("main > .bar")
      || document.querySelector("header")
      || document.body;
    holder.append(themeButton);
  }
  const themeText = Object.freeze({
    zh: { light: "☀ 切換淺色", dark: "☾ 切換深色",
      lightAria: "切換為淺色背景", darkAria: "切換為深色背景" },
    en: { light: "☀ Light mode", dark: "☾ Dark mode",
      lightAria: "Switch to light background", darkAria: "Switch to dark background" },
    ja: { light: "☀ ライト", dark: "☾ ダーク",
      lightAria: "明るい背景に切り替え", darkAria: "暗い背景に切り替え" }
  });
  function readTheme() {
    return preferences ? preferences.getTheme()
      : (document.body.classList.contains("light") ? "light" : "dark");
  }
  function renderThemeControl() {
    const code = Object.hasOwn(themeText, selector.value) ? selector.value : "zh";
    const labels = themeText[code];
    const current = readTheme();
    const next = current === "light" ? "dark" : "light";
    themeButton.textContent = labels[next];
    themeButton.setAttribute("aria-label", labels[next + "Aria"]);
    themeButton.setAttribute("aria-pressed", String(current === "light"));
    themeButton.title = labels[next + "Aria"];
  }
  themeButton.onclick = () => {
    if (preferences) preferences.toggleTheme();
    else {
      document.body.classList.toggle("light");
      try { localStorage.setItem(themeKey, readTheme()); } catch (_) {}
    }
    renderThemeControl();
  };
  selector.addEventListener("change", () => update(selector.value));
  selector.value = saved;
  // Keep the dashboard's existing zh/en/ja chart captions in sync.
  if (native && typeof native.onchange === "function") native.dispatchEvent(new Event("change", {bubbles:true}));
  else update(saved);
  renderThemeControl();
  window.addEventListener("storage", event => {
    if (event.key === storeKey) {
      selector.value = preferences ? preferences.getLanguage()
        : (Object.hasOwn(TITLES, event.newValue) ? event.newValue : "zh");
      selector.dispatchEvent(new Event("change", {bubbles:true}));
    }
    if (event.key === themeKey) renderThemeControl();
  });
})();
