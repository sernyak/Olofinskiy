/* =====================================================================
   Микола Олофінський — landing interactions
   ===================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------
     LEAD DELIVERY CONFIG
     By default the form has NO backend: on submit it copies a clean
     summary to the clipboard and opens Facebook so the lead can be
     pasted into Messenger.
     To receive leads automatically (email/CRM/Telegram), set
     LEAD_ENDPOINT to a POST URL (e.g. a https://formsubmit.co/<email>
     activated endpoint). When set, the form POSTs there instead.
  ---------------------------------------------------------------- */
  var LEAD_ENDPOINT = ""; // e.g. "https://formsubmit.co/ajax/EMAIL_HERE"
  var FACEBOOK_URL = "https://www.facebook.com/harakternik88";

  var header = document.getElementById("lpHeader");
  var progress = document.getElementById("scrollProgress");
  var sticky = document.getElementById("stickyCta");
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- header + progress + sticky CTA (rAF-throttled) ---- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 24);
    if (progress) {
      var max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
    if (sticky) {
      var apply = document.getElementById("apply");
      var nearForm = apply && apply.getBoundingClientRect().top < window.innerHeight * 0.8;
      sticky.classList.toggle("show", y > window.innerHeight * 0.6 && !nearForm);
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---- scroll reveal w/ stagger ---- */
  document.querySelectorAll(".heads, .outcome-grid, .testimonials").forEach(function (group) {
    group.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.setProperty("--d", (i % 3) * 0.09 + "s");
    });
  });
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- FAQ: keep it an accordion (one open at a time) ---- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---- qualification form ---- */
  var form = document.getElementById("applyForm");
  var success = document.getElementById("applySuccess");
  var successText = document.getElementById("successText");

  function fieldOf(input) { return input.closest(".field"); }

  function validate() {
    var ok = true;
    form.querySelectorAll("[required]").forEach(function (input) {
      var valid = input.value.trim() !== "";
      var f = fieldOf(input);
      if (f) f.classList.toggle("invalid", !valid);
      if (!valid && ok) input.focus();
      if (!valid) ok = false;
    });
    return ok;
  }

  // clear invalid state as the user types
  if (form) {
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        var f = fieldOf(input);
        if (f) f.classList.remove("invalid");
      });
    });
  }

  function buildSummary(data) {
    return (
      "Заявка на консультацію\n" +
      "————————————————\n" +
      "Ім'я: " + data.name + "\n" +
      "Контакт: " + data.contact + "\n" +
      "Роль: " + data.role + "\n" +
      "Запит: " + data.request
    );
  }

  function showSuccess(viaBackend) {
    if (!form || !success) return;
    form.hidden = true;
    success.hidden = false;
    if (successText && !viaBackend) {
      successText.textContent =
        "Я особисто прочитаю її та відповім протягом 1–2 днів. " +
        "Текст заявки скопійовано — за бажанням продовжіть розмову в Facebook, вставивши його у повідомлення.";
    } else if (successText && viaBackend) {
      successText.textContent = "Я особисто прочитаю її та відповім протягом 1–2 днів.";
    }
    success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var data = {
        name: form.name.value.trim(),
        contact: form.contact.value.trim(),
        role: form.role.value.trim(),
        request: form.request.value.trim()
      };

      // Path A: real backend configured -> POST and done.
      if (LEAD_ENDPOINT) {
        var btn = form.querySelector(".form-submit");
        if (btn) { btn.disabled = true; btn.textContent = "Надсилаю…"; }
        fetch(LEAD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function () { showSuccess(true); })
          .catch(function () { bridgeToFacebook(data); });
        return;
      }

      // Path B: no backend -> clipboard + Facebook bridge.
      bridgeToFacebook(data);
    });
  }

  function bridgeToFacebook(data) {
    var summary = buildSummary(data);
    var openFb = function () { window.open(FACEBOOK_URL, "_blank", "noopener"); };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(function () {
        showSuccess(false); openFb();
      }).catch(function () { showSuccess(false); openFb(); });
    } else {
      showSuccess(false); openFb();
    }
  }
})();
