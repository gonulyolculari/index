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
