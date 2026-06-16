/* =====================================================================
   Микола Олофінський — interactions
   ===================================================================== */
(function () {
  "use strict";

  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const toggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const yearEl = document.getElementById("year");

  /* ---- current year in footer ---- */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- sticky header + scroll progress (rAF-throttled) ---- */
  let ticking = false;
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 24);

    if (progress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (y / max) * 100 : 0;
      progress.style.width = pct + "%";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  function setMenu(open) {
    if (!mobileMenu || !toggle) return;
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("open"));
    });
  }
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* ---- scroll reveal with stagger ---- */
  const reveals = document.querySelectorAll(".reveal");

  // assign a small incremental delay to siblings inside the same grid group
  document.querySelectorAll(".focus-grid, .heads, .aud-grid").forEach(function (group) {
    group.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.setProperty("--d", (i % 3) * 0.09 + "s");
    });
  });

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- FAQ accordion (one open at a time) ---- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---- subtle parallax on hero emblem ---- */
  const emblem = document.querySelector(".hero-emblem-bg");
  if (emblem && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", function () {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        emblem.style.opacity = String(Math.max(0.02, 0.05 - y / 12000));
      }
    }, { passive: true });
  }
})();
