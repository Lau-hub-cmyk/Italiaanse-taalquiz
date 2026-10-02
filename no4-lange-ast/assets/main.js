/* No.4 Lange Ast, shared script.
   Loaded in the head so the saved language is applied before the page paints.
   Pattern: every visible text exists four times, as .lang-nl, .lang-en, .lang-fr and .lang-de.
   The html lang attribute decides which one is shown (see styles.css). */

(function () {
  "use strict";

  var STORAGE_KEY = "no4-lang";
  var LANGS = ["nl", "en", "fr", "de"];
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

    // Slideshow button labels (previous, next and dots)
    var navs = document.querySelectorAll("[data-navlabel-" + lang + "]");
    for (var n = 0; n < navs.length; n++) {
      navs[n].setAttribute("aria-label", navs[n].getAttribute("data-navlabel-" + lang));
    }
    var sdots = document.querySelectorAll("[data-dot-" + lang + "]");
    for (var m = 0; m < sdots.length; m++) {
      sdots[m].setAttribute("aria-label", sdots[m].getAttribute("data-dot-" + lang));
    }

    // Language buttons
    var buttons = document.querySelectorAll(".lang-btn");
    for (var k = 0; k < buttons.length; k++) {
      var active = buttons[k].getAttribute("data-lang") === lang;
      buttons[k].setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  function init() {
    applyLanguage(current);

    var buttons = document.querySelectorAll(".lang-btn");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var next = this.getAttribute("data-lang");
        if (LANGS.indexOf(next) < 0) return;
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

    initSlideshows();
  }

  function initSlideshows() {
    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      reduceMotion = false;
    }

    var shows = document.querySelectorAll("[data-slideshow]");
    for (var s = 0; s < shows.length; s++) {
      setupSlideshow(shows[s], reduceMotion);
    }
  }

  function setupSlideshow(root, reduceMotion) {
    var track = root.querySelector(".slides");
    var slides = root.querySelectorAll(".slides img");
    var dots = root.querySelectorAll(".slide-dots .dot");
    var prev = root.querySelector(".slide-nav.prev");
    var next = root.querySelector(".slide-nav.next");
    var total = slides.length;
    if (total < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(i) {
      index = (i + total) % total;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      for (var d = 0; d < dots.length; d++) {
        dots[d].setAttribute("aria-current", d === index ? "true" : "false");
      }
    }

    function stepNext() {
      show(index + 1);
    }

    function start() {
      if (reduceMotion || timer) {
        return;
      }
      timer = window.setInterval(stepNext, 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function restart() {
      stop();
      start();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    for (var d = 0; d < dots.length; d++) {
      (function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      })(dots[d], d);
    }

    // Pause on hover or focus so people can read at their own pace.
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    // Swipe on touch screens.
    var startX = null;
    root.addEventListener("touchstart", function (event) {
      startX = event.touches[0].clientX;
      stop();
    }, { passive: true });
    root.addEventListener("touchend", function (event) {
      if (startX === null) {
        return;
      }
      var dx = event.changedTouches[0].clientX - startX;
      if (dx > 40) {
        show(index - 1);
      } else if (dx < -40) {
        show(index + 1);
      }
      startX = null;
      start();
    });

    show(0);
    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
