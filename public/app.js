const PAGE_BY_PATH = {
  "/": "home",
  "/about": "about"
};

const titleEl = document.querySelector("#title");
const eyebrowEl = document.querySelector("#eyebrow");
const headlineEl = document.querySelector("#headline");
const bodyEl = document.querySelector("#body");
const ctaEl = document.querySelector("#cta");
const visitsEl = document.querySelector("#visits");
const pathEls = document.querySelectorAll("[data-path]");

function setActiveLink() {
  pathEls.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === location.pathname);
  });
}

async function loadPage() {
  const key = PAGE_BY_PATH[location.pathname] || "home";
  setActiveLink();

  try {
    const res = await fetch(`/api/pages/${key}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);

    const page = json.data;
    document.title = `${page.title} · Vanilla HTTP`;
    titleEl.textContent = page.title;
    eyebrowEl.textContent = page.eyebrow;
    headlineEl.textContent = page.headline;
    bodyEl.textContent = page.body;
    ctaEl.textContent = page.cta;
    ctaEl.href = page.ctaHref;
    visitsEl.textContent = `${page.visits} visita${page.visits === 1 ? "" : "s"} · ${page.slug}`;
  } catch (error) {
    headlineEl.textContent = "No se pudo leer el JSON";
    bodyEl.textContent = error.message;
  }
}

loadPage();
