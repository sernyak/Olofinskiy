/* ==========================================================================
   Микола Олофінський — site-v5 interactions
   Reveal + parallax language from landing_page, plus nav / faq / progress.
   ========================================================================== */
(function () {
  "use strict";

  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const toggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const yearEl = document.getElementById("year");
  const heroImage = document.querySelector(".hero-image");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- sticky header + scroll progress + hero parallax (rAF-throttled) ---- */
  let ticking = false;
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 24);

    if (progress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }

    if (heroImage && !reduceMotion && window.innerWidth > 980 && y < window.innerHeight) {
      heroImage.style.transform = "translateY(" + y * 0.3 + "px)";
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
  if (toggle) toggle.addEventListener("click", function () { setMenu(!mobileMenu.classList.contains("open")); });
  if (mobileMenu) mobileMenu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---- scroll reveal (IntersectionObserver, from landing_page) ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("active"); io.unobserve(entry.target); }
      });
    }, { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("active"); });
  }

  /* ---- FAQ accordion (one open at a time) ---- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });
})();
