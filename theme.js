(function () {
  "use strict";

  var storageKey = "site-theme";
  var root = document.documentElement;

  function getPreferredTheme() {
    var stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(storageKey, theme);
    updateButtons(theme);
  }

  function updateButtons(theme) {
    var isDark = theme === "dark";
    var label = isDark ? "Passer en mode clair" : "Passer en mode sombre";
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", isDark ? "true" : "false");
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
      button.setAttribute("data-theme-mode", isDark ? "dark" : "light");
      var srText = button.querySelector(".sr-only");
      if (srText) {
        srText.textContent = label;
      }
    });
  }

  function init() {
    setTheme(getPreferredTheme());
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var current =
          root.getAttribute("data-theme") === "dark" ? "dark" : "light";
        setTheme(current === "dark" ? "light" : "dark");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
