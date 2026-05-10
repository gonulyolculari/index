(() => {
  const LOADER_MIN_TIME = 1000;
  const startedAt = Date.now();
  let finished = false;

  function markLazyMedia() {
    document.querySelectorAll("img").forEach((image) => {
      image.loading = image.loading || "lazy";
      image.decoding = image.decoding || "async";
      image.classList.add("lazy-media");

      if (image.complete) {
        image.classList.add("is-loaded");
      }

      if (image.dataset.lazyBound === "true") {
        return;
      }

      image.dataset.lazyBound = "true";
      image.addEventListener("load", () => image.classList.add("is-loaded"), { once: true });
      image.addEventListener("error", () => image.classList.add("is-loaded"), { once: true });
    });
  }

  function finishLoader() {
    if (finished) {
      return;
    }

    finished = true;
    const loader = document.querySelector(".site-loader");
    const remaining = Math.max(0, LOADER_MIN_TIME - (Date.now() - startedAt));

    window.setTimeout(() => {
      document.body.classList.remove("site-loading");
      document.body.classList.add("site-ready");

      if (!loader) {
        return;
      }

      loader.classList.add("is-hiding");
      window.setTimeout(() => loader.remove(), 420);
    }, remaining);
  }

  function getLogoPath() {
    const logo = document.querySelector(".brand-logo");
    return logo ? logo.getAttribute("src") : "assets/images/logo-gonul-yolculari.png";
  }

  function addBackToTop() {
    const button = document.createElement("button");
    button.className = "back-to-top";
    button.type = "button";
    button.setAttribute("aria-label", "Başa dön");
    button.innerHTML = "<span>&uarr;</span>";
    document.body.appendChild(button);

    const updateVisibility = () => {
      button.classList.toggle("is-visible", window.scrollY > 420);
    };

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();
  }

  function getRelativeBase() {
    const path = window.location.pathname.replace(/\\/g, "/");

    if (path.includes("/mezarlik-projesi/") && !path.endsWith("/mezarlik-projesi/") && !path.endsWith("/mezarlik-projesi/index.html")) {
      return "../../";
    }

    if (path.includes("/calismalarimiz/") || path.includes("/gonul-sofralari/") || path.includes("/mezarlik-projesi/")) {
      return "../";
    }

    return "";
  }

  function enhanceFooterLinks() {
    const base = getRelativeBase();

    document.querySelectorAll(".footer h4").forEach((heading) => {
      if (heading.textContent.trim().toLocaleLowerCase("tr-TR") !== "sayfalar") {
        return;
      }

      const target = heading.nextElementSibling;

      if (!target) {
        return;
      }

      target.innerHTML = `
        <a href="${base}index.html">Anasayfa</a>
        <a href="${base}calismalarimiz/index.html">&Ccedil;al&#305;&#351;malar&#305;m&#305;z</a>
        <a href="${base}gonul-sofralari/index.html">G&ouml;n&uuml;l Sofralar&#305;</a>
        <a href="${base}mezarlik-projesi/index.html">Mezarl&#305;k &Ccedil;al&#305;&#351;mas&#305;</a>
      `;
    });
  }

  if (document.body) {
    document.body.classList.add("site-loading");
    const logoPath = getLogoPath();
    document.body.insertAdjacentHTML(
      "afterbegin",
      `
        <div class="site-loader" role="status" aria-live="polite">
          <div class="site-loader-mark">
            <img src="${logoPath}" alt="Gönül Yolcuları">
          </div>
          <strong>Yükleniyor</strong>
          <span></span>
        </div>
      `
    );
    markLazyMedia();
    addBackToTop();
    enhanceFooterLinks();

    const mediaObserver = new MutationObserver(markLazyMedia);
    mediaObserver.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    markLazyMedia();
    enhanceFooterLinks();
  });
  window.addEventListener("load", finishLoader, { once: true });
  window.setTimeout(finishLoader, 1800);
})();

const placeList = document.getElementById("placeList");
const placeHeader = document.getElementById("placeHeader");
const placeTombList = document.getElementById("placeTombList");
const dynamicContent = document.getElementById("dynamicContent");
const placePageTitle = document.getElementById("placePageTitle");
const placePageIntro = document.getElementById("placePageIntro");
const currentPlaceId = document.body.dataset.placeId || "";

let siteData = { mekanlar: [], turbeler: [] };

function getDataPath() {
  return currentPlaceId ? "../../data/turbeler.json" : "../data/turbeler.json";
}

function resolveAssetPath(path) {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return currentPlaceId ? `../${path}` : path;
}

function renderError(target, message) {
  if (!target) {
    return;
  }

  target.innerHTML = `<div class="error-box">${message}</div>`;
}

function renderPlaces() {
  if (!placeList) {
    return;
  }

  placeList.innerHTML = siteData.mekanlar
    .map(
      (place) => `
        <a class="place-card ${place.renk || ""}" href="${place.id}/index.html">
          <div class="place-mark">${place.ad.charAt(0)}</div>
          <h3>${place.ad}</h3>
          <p>${place.ozet}</p>
        </a>
      `
    )
    .join("");
}

function renderPlacePage() {
  const place = siteData.mekanlar.find((item) => item.id === currentPlaceId);

  if (!place) {
    renderError(
      placeHeader || placeTombList || dynamicContent,
      "Bu mezarlık sayfası için kayıt bulunamadı. Lütfen ana mezarlık listesine dönün."
    );
    return;
  }

  const tombs = siteData.turbeler.filter((tomb) => tomb.mekanId === place.id);

  if (placePageTitle) {
    placePageTitle.textContent = place.ad;
  }

  if (placePageIntro) {
    placePageIntro.textContent =
      "Bu sayfada seçilen mezarlığın içindeki gerçek mezar ve türbe kayıtları listelenir. Bir karta bastığınızda detay bilgisi bu sayfanın altında açılır.";
  }

  document.title = `${place.ad} - Gönül Yolcuları`;

  if (dynamicContent) {
    dynamicContent.innerHTML = "";
  }

  if (placeHeader) {
    placeHeader.innerHTML = `
      <div class="selection-panel">
        <h2>${place.ad}</h2>
        <p>${place.ozet}</p>
      </div>
    `;
  }

  if (placeTombList) {
    placeTombList.innerHTML = `
      <div class="section-title-wrap">
        <span class="mini-line"></span>
        <h2>İçindeki Mezarlar</h2>
      </div>
      <div class="turbe-grid">
        ${tombs
          .map(
            (tomb) => `
              <article class="turbe-card" data-tomb="${tomb.id}">
                <img class="turbe-cover" src="${resolveAssetPath(tomb.gorsel)}" alt="${tomb.baslik}" loading="lazy" decoding="async">
                <div class="turbe-body">
                  <h3>${tomb.baslik}</h3>
                  <div class="location-row">
                    <span class="loc-pin"></span>
                    <span>${tomb.konum}</span>
                  </div>
                  <div class="turbe-sep"></div>
                  <div class="turbe-text">${tomb.kisaAciklama}</div>
                  <span class="read-more">Detay için tıklayınız.</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;

    placeTombList.querySelectorAll("[data-tomb]").forEach((card) => {
      card.addEventListener("click", () => {
        const tomb = siteData.turbeler.find((item) => item.id === card.dataset.tomb);
        renderDetail(tomb);
      });
    });
  }
}

function renderDetail(tomb) {
  if (!dynamicContent || !tomb) {
    return;
  }

  dynamicContent.innerHTML = `
    <button class="back-btn" id="backToList">← Mezar Listesine Dön</button>
    <div class="detail-layout">
      <div class="detail-panel">
        <img src="${resolveAssetPath(tomb.gorsel)}" alt="${tomb.baslik}" loading="lazy" decoding="async">
        <div class="detail-content">
          <h2>${tomb.baslik}</h2>
          <div class="place">${tomb.konum}</div>
          <p>${tomb.detay}</p>
        </div>
      </div>
      <div>
        <div class="text-box">
          <strong>Kitabe / Kaynak Notu</strong>
          <p>${tomb.osmanlica}</p>
        </div>
        <div class="text-box">
          <strong>Günümüz Türkçesi</strong>
          <p>${tomb.turkce}</p>
        </div>
        <div class="text-box">
          <strong>İngilizce</strong>
          <p>${tomb.ingilizce}</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("backToList").addEventListener("click", () => {
    dynamicContent.innerHTML = "";

    if (placeTombList) {
      placeTombList.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  dynamicContent.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadData() {
  try {
    const response = await fetch(getDataPath());

    if (!response.ok) {
      throw new Error("Veri dosyası okunamadı.");
    }

    siteData = await response.json();

    if (placeList) {
      renderPlaces();
    }

    if (currentPlaceId) {
      renderPlacePage();
    }
  } catch (error) {
    renderError(
      placeList || placeHeader || placeTombList || dynamicContent,
      "Veri yüklenemedi. GitHub Pages üzerinde çalıştırınca düzelecektir. Yerelde test için küçük bir sunucu kullanın."
    );
  }
}

if (placeList || currentPlaceId) {
  loadData();
}
