(() => {
  const STORAGE_KEY = "vibedocs:locale";
  const currentLang = document.documentElement.lang.toLowerCase();
  const currentLocale = currentLang.startsWith("zh") ? "zh" : "en";

  const getPreferredLocale = () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "zh") {
        return stored;
      }
    } catch {
      // Ignore storage access issues and fall back to browser language.
    }

    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  };

  const setPreferredLocale = (locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore storage access issues for static-site browsing.
    }
  };

  const localeFromLink = (link) => {
    const label = link.textContent.trim().toLowerCase();
    return label.includes("中文") ? "zh" : "en";
  };

  document.querySelectorAll(".locale-link").forEach((link) => {
    link.addEventListener("click", () => {
      setPreferredLocale(localeFromLink(link));
    });
  });

  const shouldAutoRedirect = document.body.dataset.autoLocaleRoot === "true";
  const preferredLocale = getPreferredLocale();

  if (shouldAutoRedirect && currentLocale === "en" && preferredLocale === "zh") {
    const zhLink = Array.from(document.querySelectorAll(".locale-link")).find(
      (link) => localeFromLink(link) === "zh",
    );

    if (zhLink) {
      window.location.replace(new URL(zhLink.getAttribute("href"), window.location.href));
    }
  }
})();
