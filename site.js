(function () {
  const PAGES = ["home", "download", "contact"];
  const URLS = {
    home: "/",
    download: "/bass-harmonizer-updates/",
    contact: "/contact/"
  };
  const TITLES = {
    home: "BASS HARMONIZER — free bass harmonizer VST3 / AU plugin by SIGFRIDA",
    download: "Download BASS HARMONIZER — Windows VST3 / Mac VST3 + AU",
    contact: "Contact — SIGFRIDA / BASS HARMONIZER"
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = pageFromLocation();
  let busy = false;

  function pageFromLocation() {
    const path = (location.pathname || "/").replace(/\/+$/, "") || "/";
    if (path.endsWith("bass-harmonizer-updates")) return "download";
    if (path.endsWith("contact")) return "contact";
    return "home";
  }

  function panel(name) {
    return document.querySelector('.panel[data-page="' + name + '"]');
  }

  function syncNav(name) {
    document.documentElement.dataset.page = name;
    document.title = TITLES[name] || TITLES.home;
    document.querySelectorAll(".nav a[data-go]").forEach((a) => {
      if (a.getAttribute("data-go") === name) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function show(next, instant) {
    const nextEl = panel(next);
    const curEl = panel(current);
    if (!nextEl || next === current) {
      syncNav(next);
      return;
    }

    const dir = PAGES.indexOf(next) - PAGES.indexOf(current);

    if (instant || reduce || !curEl || dir === 0) {
      document.querySelectorAll(".panel").forEach((p) => {
        p.classList.remove("is-active", "is-leaving", "is-entering", "is-animating", "from-left", "from-right", "to-left", "to-right");
      });
      nextEl.classList.add("is-active");
      current = next;
      syncNav(next);
      return;
    }

    if (busy) return;
    busy = true;

    const incoming = dir > 0 ? "from-right" : "from-left";
    const outgoing = dir > 0 ? "to-left" : "to-right";

    nextEl.classList.add("is-entering", incoming);
    void nextEl.offsetWidth;
    nextEl.classList.add("is-animating");
    curEl.classList.add("is-animating", "is-leaving", outgoing);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        nextEl.classList.add("is-active");
        nextEl.classList.remove(incoming);
      });
    });

    let done = false;
    const finish = (event) => {
      if (done) return;
      if (event && event.propertyName && event.propertyName !== "transform") return;
      done = true;
      curEl.removeEventListener("transitionend", finish);
      curEl.classList.remove("is-active", "is-leaving", "is-animating", "to-left", "to-right");
      nextEl.classList.remove("is-entering", "is-animating", "from-left", "from-right");
      busy = false;
    };

    curEl.addEventListener("transitionend", finish);
    setTimeout(finish, 600);

    current = next;
    syncNav(next);
  }

  function go(next, push) {
    if (!PAGES.includes(next) || next === current) return;
    show(next, false);
    if (push !== false) history.pushState({ page: next }, "", URLS[next]);
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-go]");
    if (!link) return;
    const next = link.getAttribute("data-go");
    if (!PAGES.includes(next)) return;
    event.preventDefault();
    go(next, true);
  });

  window.addEventListener("popstate", () => {
    const next = pageFromLocation();
    if (next === current) return;
    show(next, false);
  });

  document.querySelectorAll(".panel").forEach((p) => {
    p.classList.remove("is-active", "is-leaving", "is-entering", "is-animating", "from-left", "from-right", "to-left", "to-right");
  });
  const start = panel(current);
  if (start) start.classList.add("is-active");
  syncNav(current);

  const ua = navigator.userAgent || "";
  if (/Mac|iPhone|iPad/.test(ua)) {
    const mac = document.getElementById("mac");
    if (mac) mac.classList.add("suggested");
  } else if (/Windows/.test(ua)) {
    const win = document.getElementById("win");
    if (win) win.classList.add("suggested");
  }

  fetch("https://api.github.com/repos/prodsigfrida-stack/bass-harmonizer-updates/releases/tags/latest")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data) return;
      const name = (data.name || "").replace(/^BASS HARMONIZER\s*/i, "").trim();
      const el = document.getElementById("version");
      if (name && el) el.textContent = name;
    })
    .catch(() => {});

  if (new URLSearchParams(location.search).get("thanks") === "1") {
    const thanks = document.getElementById("thanks");
    if (thanks) thanks.hidden = false;
  }

  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", () => {
      const email = (document.getElementById("feedback-email").value || "").trim();
      const reply = document.getElementById("replyto");
      if (reply) reply.value = email;
    });
  }
})();
