/* No.4 Lange Ast, shared script.
   Loaded in the head so the saved language is applied before the page paints.
   Pattern: every visible text exists twice, as .lang-nl and .lang-en.
   The html lang attribute decides which one is shown (see styles.css). */

(function () {
  "use strict";

  var STORAGE_KEY = "no4-lang";
  var LANGS = ["nl", "en"];
  var root = document.documentElement;

  function readSaved() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return LANGS.indexOf(value) > -1 ? value : null;
    } catch (e) {
      return null;
    }
  }

  function save(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* Storage can be blocked, the page still works without it. */
    }
  }

  // Set the language on the html element straight away, default Dutch.
  var current = readSaved() || "nl";
  root.setAttribute("lang", current);

  function applyLanguage(lang) {
    current = lang;
    root.setAttribute("lang", lang);

    // Page title
    var title = document.querySelector("title");
    if (title && title.getAttribute("data-" + lang)) {
      document.title = title.getAttribute("data-" + lang);
    }

    // Meta description
    var meta = document.querySelector('meta[name="description"]');
    if (meta && meta.getAttribute("data-" + lang)) {
      meta.setAttribute("content", meta.getAttribute("data-" + lang));
    }

    // Image alt text
    var imgs = document.querySelectorAll("img[data-alt-" + lang + "]");
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].setAttribute("alt", imgs[i].getAttribute("data-alt-" + lang));
    }

    // Iframe titles
    var frames = document.querySelectorAll("iframe[data-title-" + lang + "]");
    for (var j = 0; j < frames.length; j++) {
      frames[j].setAttribute("title", frames[j].getAttribute("data-title-" + lang));
    }

    // Toggle button label for screen readers
    var toggles = document.querySelectorAll(".lang-toggle");
    for (var k = 0; k < toggles.length; k++) {
      toggles[k].setAttribute(
        "aria-label",
        lang === "nl" ? "Switch to English" : "Schakel naar Nederlands"
      );
    }
  }

  function init() {
    applyLanguage(current);

    var toggles = document.querySelectorAll(".lang-toggle");
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener("click", function () {
        var next = current === "nl" ? "en" : "nl";
        save(next);
        applyLanguage(next);
      });
    }

    // Mobile menu
    var header = document.querySelector(".site-header");
    var menuBtn = document.querySelector(".menu-toggle");
    if (header && menuBtn) {
      menuBtn.addEventListener("click", function () {
        var open = header.classList.toggle("menu-open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && header.classList.contains("menu-open")) {
          header.classList.remove("menu-open");
          menuBtn.setAttribute("aria-expanded", "false");
          menuBtn.focus();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
