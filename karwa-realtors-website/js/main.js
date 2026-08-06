/* ============================================================
   KARWA REALTORS — interactions
   Loader, header, reveals, counters, parallax, 3D tilt cards,
   slideshows, testimonials, timeline, FAQ, filters, transitions.
   ============================================================ */

(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  const loader = document.querySelector(".loader");
  if (loader) {
    const done = () => {
      loader.classList.add("is-done");
      document.body.classList.add("is-entering");
      sessionStorage.setItem("kr-visited", "1");
    };
    if (sessionStorage.getItem("kr-visited") || reduceMotion) {
      // Skip long intro on repeat views within the session
      setTimeout(done, 300);
    } else {
      window.addEventListener("load", () => setTimeout(done, 1900));
      setTimeout(done, 3500); // safety
    }
  }

  /* ---------- Page transitions (internal links) ---------- */
  const veil = document.querySelector(".veil");
  if (veil) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") ||
          href.startsWith("mailto:") || href.startsWith("tel:") ||
          a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      veil.classList.add("is-in");
      setTimeout(() => { window.location.href = href; }, 480);
    });
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) veil.classList.remove("is-in");
    });
  }

  /* ---------- Hero photo slideshow ---------- */
  const heroSlides = [...document.querySelectorAll(".hero-slide")];
  const heroDots = [...document.querySelectorAll(".hero-dots i")];
  if (heroSlides.length > 1 && !reduceMotion) {
    let hi = 0;
    setInterval(() => {
      heroSlides[hi].classList.remove("is-active");
      heroDots[hi] && heroDots[hi].classList.remove("is-active");
      hi = (hi + 1) % heroSlides.length;
      heroSlides[hi].classList.add("is-active");
      heroDots[hi] && heroDots[hi].classList.add("is-active");
    }, 7000);
  }

  /* ---------- Header: transparent → solid ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-solid", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll(".nav a").forEach(a =>
      a.addEventListener("click", () => document.body.classList.remove("nav-open"))
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("is-visible");
        revealIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .reveal-line, .tl-item").forEach(el => revealIO.observe(el));

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const dur = 1800;
    const t0 = performance.now();
    const fmt = (v) => el.dataset.decimals
      ? v.toFixed(+el.dataset.decimals)
      : Math.round(v).toString();
    function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    if (reduceMotion) { el.textContent = fmt(target); return; }
    requestAnimationFrame(tick);
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        animateCounter(en.target);
        countIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(el => countIO.observe(el));

  /* ---------- Parallax (translateY only — GPU friendly) ---------- */
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;
    function parallax() {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ---------- 3D tilt cards ---------- */
  document.querySelectorAll("[data-tilt]").forEach(card => {
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
    let raf = null;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `rotateY(${(px * 7).toFixed(2)}deg) rotateX(${(-py * 7).toFixed(2)}deg) translateZ(0)`;
      });
    });
    card.addEventListener("pointerleave", () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  });

  /* ---------- Category card auto-slideshows ---------- */
  document.querySelectorAll(".cat-card").forEach((card, ci) => {
    const slides = [...card.querySelectorAll(".cat-slide")];
    const dots = [...card.querySelectorAll(".cat-dots i")];
    if (slides.length < 2) return;
    let i = 0;
    setInterval(() => {
      slides[i].classList.remove("is-active");
      dots[i] && dots[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
      dots[i] && dots[i].classList.add("is-active");
    }, 3400 + ci * 500); // desynchronized per card
  });

  /* ---------- Testimonials slider ---------- */
  const testi = document.querySelector(".testi");
  if (testi) {
    const slides = [...testi.querySelectorAll(".testi-slide")];
    const nav = document.querySelector(".testi-nav");
    let i = 0, timer;
    const btns = slides.map((_, idx) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Testimonial " + (idx + 1));
      b.addEventListener("click", () => { go(idx); restart(); });
      nav.appendChild(b);
      return b;
    });
    function go(n) {
      slides[i].classList.remove("is-active");
      btns[i].classList.remove("is-active");
      i = n % slides.length;
      slides[i].classList.add("is-active");
      btns[i].classList.add("is-active");
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => go(i + 1), 6000);
    }
    go(0); restart();
  }

  /* ---------- Timeline progress line ---------- */
  const tl = document.querySelector(".timeline");
  const tlProgress = document.querySelector(".timeline-progress");
  if (tl && tlProgress) {
    window.addEventListener("scroll", () => {
      const r = tl.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
      tlProgress.style.height = (p * 100) + "%";
    }, { passive: true });
  }

  /* ---------- FAQ accordions ---------- */
  document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", open);
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
    });
  });

  /* ---------- Project filters ---------- */
  const filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    const cards = [...document.querySelectorAll(".proj-card")];
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const show = f === "all" || c.dataset.status === f;
        if (show) {
          c.classList.remove("is-hidden");
          c.style.opacity = "0";
          c.style.transform = "translateY(18px)";
          requestAnimationFrame(() => requestAnimationFrame(() => {
            c.style.opacity = "1";
            c.style.transform = "translateY(0)";
          }));
        } else {
          c.classList.add("is-hidden");
        }
      });
    });
  }

  /* ---------- Enquiry form (posts to Web3Forms, host-independent) ---------- */
  const form = document.querySelector("form.enquiry");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = form.querySelector(".form-success");
      const btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; }
      const showDone = () => {
        ok.classList.add("is-shown");
        ok.scrollIntoView({ behavior: "smooth", block: "center" });
        form.querySelectorAll("input, select, textarea, button[type=submit]")
          .forEach(el => el.disabled = true);
      };
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" },
      }).then(showDone).catch(showDone);
    });
  }

  /* ---------- Active nav link ---------- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("is-active");
  });
})();
