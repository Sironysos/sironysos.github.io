(function () {
  "use strict";

  function createSvgIcon(viewBox, pathData, className) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.classList.add("theme-toggle__svg");
    if (className) {
      svg.classList.add(className);
    }

    pathData.forEach(function (d) {
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });

    return svg;
  }

  function buildHeader(config) {
    var header = document.createElement("header");
    header.className = "site-header";

    var inner = document.createElement("div");
    inner.className = "header-inner";

    var brand = document.createElement("a");
    brand.className = "brand";
    brand.href = config.brandHref;

    var title = document.createElement("h1");
    title.className = "brand-title";
    title.textContent = config.title;
    brand.appendChild(title);

    var actions = document.createElement("div");
    actions.className = "header-actions";

    if (config.backHref && config.backLabel) {
      var backLink = document.createElement("a");
      backLink.className = "back-link";
      backLink.href = config.backHref;
      backLink.textContent = config.backLabel;
      actions.appendChild(backLink);
    }

    var themeButton = document.createElement("button");
    themeButton.type = "button";
    themeButton.className = "theme-toggle";
    themeButton.setAttribute("data-theme-toggle", "");
    themeButton.setAttribute("aria-pressed", "false");
    themeButton.setAttribute("aria-label", "Passer en mode sombre");
    themeButton.setAttribute("title", "Passer en mode sombre");

    var sunIcon = document.createElement("span");
    sunIcon.className = "theme-toggle__icon theme-toggle__icon--sun";
    sunIcon.setAttribute("aria-hidden", "true");
    sunIcon.appendChild(
      createSvgIcon(
        "0 0 24 24",
        [
          "M12 4V2",
          "M12 22v-2",
          "M4 12H2",
          "M22 12h-2",
          "M6.34 6.34 4.93 4.93",
          "m19.07 19.07-1.41-1.41",
          "m17.66 6.34 1.41-1.41",
          "m4.93 19.07 1.41-1.41",
          "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10",
        ],
        "theme-toggle__svg--sun",
      ),
    );

    var moonIcon = document.createElement("span");
    moonIcon.className = "theme-toggle__icon theme-toggle__icon--moon";
    moonIcon.setAttribute("aria-hidden", "true");
    moonIcon.appendChild(
      createSvgIcon(
        "0 0 24 24",
        ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8"],
        "theme-toggle__svg--moon",
      ),
    );

    var screenReaderLabel = document.createElement("span");
    screenReaderLabel.className = "sr-only";
    screenReaderLabel.textContent = "Passer en mode sombre";

    var knob = document.createElement("span");
    knob.className = "theme-toggle__knob";
    knob.setAttribute("aria-hidden", "true");

    themeButton.appendChild(sunIcon);
    themeButton.appendChild(moonIcon);
    themeButton.appendChild(screenReaderLabel);
    themeButton.appendChild(knob);
    actions.appendChild(themeButton);

    inner.appendChild(brand);
    inner.appendChild(actions);
    header.appendChild(inner);

    return header;
  }

  function buildFooter(config) {
    var footer = document.createElement("footer");
    footer.className = "site-footer";

    var paragraph = document.createElement("p");
    paragraph.textContent =
      "\u00a9 " + new Date().getFullYear() + " " + config.footerName;

    footer.appendChild(paragraph);
    return footer;
  }

  function getConfig() {
    var body = document.body;
    return {
      title: body.getAttribute("data-layout-title") || "Sironysos",
      brandHref: body.getAttribute("data-layout-brand-href") || "index.html",
      backHref: body.getAttribute("data-layout-back-href") || "",
      backLabel: body.getAttribute("data-layout-back-label") || "",
      footerName: body.getAttribute("data-layout-footer-name") || "Sironysos",
    };
  }

  function renderLayout() {
    var config = getConfig();
    var headerSlot = document.querySelector("[data-layout-header]");
    var footerSlot = document.querySelector("[data-layout-footer]");

    if (headerSlot) {
      headerSlot.replaceWith(buildHeader(config));
    }

    if (footerSlot) {
      footerSlot.replaceWith(buildFooter(config));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderLayout);
  } else {
    renderLayout();
  }
})();
