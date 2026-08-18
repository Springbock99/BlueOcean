/* ============================================================
   BLUE OCEAN — site behaviour
   Vanilla JS, no dependencies. Loaded with `defer` on every page.
   The theme is *restored* by a tiny inline script in each <head>
   (before paint, so there is no flash); this file only handles
   the toggle and the scroll reveal.
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "blueocean-theme";
  var root = document.documentElement;

  /* ---------- theme toggle ---------- */
  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a1b2b" : "#f8f8f6");

    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    });
  }

  applyTheme(currentTheme());

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {}
    });
  });

  /* Follow the OS setting only while the visitor has not chosen one. */
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      var stored = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch (err) {}
      if (!stored) applyTheme(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------- lazy images fade in as they decode ----------
     Without this, a reveal container fades in while its image is still
     downloading, so you see an empty box appear and then the photo snap
     into it. */
  document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    img.classList.add("img-fade");
    var done = function () {
      img.classList.add("loaded");
    };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true }); // never leave it hidden
    if (img.complete && img.naturalWidth > 0) done(); // already decoded
  });

  var reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- the moving line ----------
     "The retreat" is one line of tiles sweeping steadily left to right.

     The markup holds ONE set of tiles, so that copy lives in exactly one
     place. Everything built here is decoration made from it: clones, enough
     of them to keep the lane wider than the screen.

     The lane slides by exactly the width of one set (handed to the CSS as
     --ring-shift). That is what makes the loop invisible: the moment the
     second set reaches where the first began, it starts over unseen. */
  if (!reduced) {
    document.querySelectorAll(".ring").forEach(function (ring) {
      var nearTrack = ring.querySelector(".ring-near .ring-track");

      var set = nearTrack
        ? Array.prototype.slice.call(nearTrack.children)
        : [];
      if (!set.length) return;

      /* A clone is decoration: hidden from screen readers, and loaded
         eagerly — these come into view by transform, which lazy loading
         does not notice, and a blank tile would break the line. */
      function copyOf(tile) {
        var el = tile.cloneNode(true);
        el.classList.add("ring-dup");
        el.setAttribute("aria-hidden", "true");
        el.querySelectorAll("img").forEach(function (img) {
          img.setAttribute("loading", "eager");
          img.setAttribute("alt", "");
          img.classList.remove("img-fade");
          img.classList.add("loaded");
        });
        return el;
      }

      /* width of one set, trailing margin included */
      function setWidth() {
        var total = 0;
        set.forEach(function (tile) {
          total +=
            tile.getBoundingClientRect().width +
            parseFloat(window.getComputedStyle(tile).marginRight || 0);
        });
        return total;
      }

      /* Enough sets to outrun the widest this window could ever be, so
         resizing never opens a gap in the line. */
      var one = setWidth();
      if (!one) return;
      var widest = Math.max(window.innerWidth, (window.screen && window.screen.width) || 0);
      var sets = Math.min(6, Math.max(2, Math.ceil(widest / one) + 1));

      var i, s;
      for (s = 1; s < sets; s++) {
        for (i = 0; i < set.length; i++) nearTrack.appendChild(copyOf(set[i]));
      }

      /* Duration follows the measured width, so the tiles drift past at
         the same speed whether the tile is 232px or 310px wide. */
      function sync() {
        var w = setWidth();
        if (!w) return;
        ring.style.setProperty("--ring-shift", "-" + w.toFixed(1) + "px");
        /* pixels per second — data-speed on the .ring, defaulting to the
           retreat's 26. Reviews run slower because they are read, not
           glanced at. */
        var pps = parseFloat(ring.getAttribute("data-speed")) || 26;
        nearTrack.style.animationDuration = (w / pps).toFixed(1) + "s";
      }

      sync();
      ring.classList.add("is-ready");

      var resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(sync, 200);
      });

      /* Turn only while it is on screen. */
      if ("IntersectionObserver" in window) {
        ring.classList.add("is-paused");
        new IntersectionObserver(
          function (entries) {
            entries.forEach(function (e) {
              e.target.classList.toggle("is-paused", !e.isIntersecting);
            });
          },
          { rootMargin: "120px 0px" }
        ).observe(ring);
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var targets = document.querySelectorAll(".reveal");
  var staggerGroups = document.querySelectorAll("[data-stagger-group]");

  function revealStaggerGroup(group) {
    group.querySelectorAll(".reveal-card").forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 100, 500) + "ms";
      el.classList.add("in");
    });
  }

  if (reduced || !("IntersectionObserver" in window)) {
    staggerGroups.forEach(function (group) {
      revealStaggerGroup(group);
    });
    targets.forEach(function (el) {
      el.classList.add("in");
    });
    return;
  }

  var staggerIo = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        staggerIo.unobserve(entry.target);
        revealStaggerGroup(entry.target);
      });
    },
    { rootMargin: "0px 0px 12% 0px", threshold: 0.15 }
  );

  staggerGroups.forEach(function (group) {
    staggerIo.observe(group);
  });

  var io = new IntersectionObserver(
    function (entries) {
      /* Animate in document order so a row of cards cascades left-to-right
         rather than in whatever order the observer happens to report. */
      var arriving = entries.filter(function (e) {
        return e.isIntersecting;
      });

      arriving.sort(function (a, b) {
        return a.boundingClientRect.top - b.boundingClientRect.top;
      });

      arriving.forEach(function (entry, i) {
        var el = entry.target;
        io.unobserve(el);
        // small stagger, capped so a long list never crawls
        el.style.transitionDelay = Math.min(i * 70, 210) + "ms";
        el.classList.add("in");
        if (el.hasAttribute("data-stagger-group")) revealStaggerGroup(el);
      });
    },
    {
      /* Positive bottom margin starts the animation ~15% of a screen before
         the element scrolls into view, so it is already settling by the time
         you actually see it. That is what removes the "pop". */
      rootMargin: "0px 0px 15% 0px",
      threshold: 0
    }
  );

  targets.forEach(function (el) {
    io.observe(el);
  });

  /* ---------- gentle image parallax ----------
     Kept intentionally small and transform-only so it reads like tide motion
     without fighting the content or hurting scroll performance. */
  var parallaxItems = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!parallaxItems.length) return;

  var ticking = false;
  function updateParallax() {
    ticking = false;
    var vh = window.innerHeight || 1;
    parallaxItems.forEach(function (img) {
      var rect = img.getBoundingClientRect();
      if (rect.bottom < -120 || rect.top > vh + 120) return;
      var strength = parseFloat(img.getAttribute("data-parallax")) || 0.06;
      var scale = parseFloat(img.getAttribute("data-parallax-scale")) || 1.04;
      var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      var y = Math.max(-26, Math.min(26, progress * -100 * strength));
      img.style.setProperty("--parallax-scale", scale);
      img.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) scale(" + scale + ")";
    });
  }

  function requestParallax() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  }

  updateParallax();
  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
})();
