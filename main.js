/* ==========================================================================
   Brightleaf Dental — site behaviour
   Progressive enhancement only: every page works with JS disabled.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------ Mobile navigation */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
      );
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close when a destination is picked or Escape is pressed.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset state if the viewport grows past the mobile breakpoint.
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* --------------------------------------------------------- Sticky header */

  function initStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ------------------------------------------------------- Scroll reveals */

  function initReveals() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = Number(el.getAttribute("data-reveal-delay") || 0);
          window.setTimeout(function () {
            el.classList.add("is-visible");
          }, delay);
          observer.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------- Stagger children of a reveal grid */

  function initStagger() {
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var step = Number(group.getAttribute("data-stagger")) || 80;
      Array.prototype.forEach.call(group.children, function (child, i) {
        if (child.hasAttribute("data-reveal")) {
          child.setAttribute("data-reveal-delay", String(i * step));
        }
      });
    });
  }

  /* --------------------------------------------------- Opening hours state */

  function initHours() {
    var table = document.querySelector("[data-hours]");
    if (!table) return;

    var today = new Date().getDay(); // 0 = Sunday
    var row = table.querySelector('[data-day="' + today + '"]');
    if (row) {
      row.classList.add("is-today");
      var label = row.querySelector("th");
      if (label) {
        var tag = document.createElement("span");
        tag.className = "visually-hidden";
        tag.textContent = " (today)";
        label.appendChild(tag);
      }
    }
  }

  /* ---------------------------------------------------------- Footer year */

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ------------------------------------------- Prefill service from ?query */

  function initServicePrefill() {
    var select = document.getElementById("treatment");
    if (!select) return;

    var wanted = new URLSearchParams(window.location.search).get("service");
    if (!wanted) return;

    var match = Array.prototype.find.call(select.options, function (opt) {
      return opt.value.toLowerCase() === wanted.toLowerCase();
    });
    if (match) select.value = match.value;
  }

  /* ------------------------------------------------------ Booking form */

  var VALIDATORS = {
    name: function (value) {
      return value.trim().length >= 2 || "Please enter your full name.";
    },
    email: function (value) {
      return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim())
        ? true
        : "Please enter a valid email address.";
    },
    phone: function (value) {
      var digits = value.replace(/[^\d]/g, "");
      return digits.length >= 7 || "Please enter a reachable phone number.";
    },
    treatment: function (value) {
      return value !== "" || "Please choose a treatment.";
    },
    message: function (value) {
      return value.trim().length >= 10 || "Tell us a little more (10+ characters).";
    },
    consent: function (_value, input) {
      return input.checked || "Please confirm we can contact you.";
    }
  };

  function validateInput(input) {
    var field = input.closest(".field");
    if (!field) return true;

    var rule = VALIDATORS[input.name];
    var result = rule ? rule(input.value, input) : true;
    var ok = result === true;

    field.classList.toggle("is-invalid", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");

    var errorEl = field.querySelector(".error");
    if (errorEl && !ok) errorEl.textContent = result;

    return ok;
  }

  function initForm() {
    var form = document.querySelector("[data-booking-form]");
    if (!form) return;

    var status = form.querySelector(".form-status");
    var submit = form.querySelector('[type="submit"]');
    var inputs = form.querySelectorAll("input[name], select[name], textarea[name]");

    inputs.forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.value !== "" || input.type === "checkbox") validateInput(input);
      });
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field && field.classList.contains("is-invalid")) validateInput(input);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      inputs.forEach(function (input) {
        if (!validateInput(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        showStatus(
          status,
          "err",
          "Please fix the highlighted fields and try again."
        );
        firstInvalid.focus();
        return;
      }

      // No backend in this static build — simulate the round trip.
      // Replace this block with a fetch() to your booking endpoint.
      var original = submit.textContent;
      submit.disabled = true;
      submit.textContent = "Sending…";

      window.setTimeout(function () {
        submit.disabled = false;
        submit.textContent = original;
        form.reset();
        form.querySelectorAll(".is-invalid").forEach(function (f) {
          f.classList.remove("is-invalid");
        });
        showStatus(
          status,
          "ok",
          "Thanks! Your request is in. A coordinator will confirm your appointment within one business day."
        );
      }, 900);
    });
  }

  function showStatus(el, kind, message) {
    if (!el) return;
    el.classList.remove("form-status--ok", "form-status--err");
    el.classList.add("is-visible", "form-status--" + kind);
    var text = el.querySelector("[data-status-text]");
    if (text) text.textContent = message;
    el.setAttribute("role", kind === "err" ? "alert" : "status");
  }

  /* ------------------------------------------------------------- Bootstrap */

  function init() {
    initNav();
    initStickyHeader();
    initStagger();
    initReveals();
    initHours();
    initYear();
    initServicePrefill();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
