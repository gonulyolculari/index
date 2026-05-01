const placeList = document.getElementById("placeList");
const dynamicContent = document.getElementById("dynamicContent");
let siteData = { mekanlar: [], turbeler: [] };

async function loadData() {
  try {
    const response = await fetch("../data/turbeler.json");

    if (!response.ok) {
      throw new Error("Veri dosyası okunamadı.");
    }

    siteData = await response.json();
    renderPlaces();
  } catch (error) {
    placeList.innerHTML = `
      <div class="error-box">
        Veri yüklenemedi. GitHub Pages üzerinde çalıştırınca düzelecektir. Yerelde test için küçük bir
        sunucu kullanın.
      </div>
    `;
  }
}

function renderPlaces() {
  placeList.innerHTML = siteData.mekanlar
    .map(
      (place) => `
        <button class="place-card ${place.renk || ""}" data-place="${place.id}">
          <div class="place-mark">${place.ad.charAt(0)}</div>
          <h3>${place.ad}</h3>
          <p>${place.ozet}</p>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => {
      const place = siteData.mekanlar.find((item) => item.id === button.dataset.place);
      renderTombList(place);
    });
  });
}

function renderTombList(place) {
  const tombs = siteData.turbeler.filter((tomb) => tomb.mekanId === place.id);

  dynamicContent.innerHTML = `
    <button class="back-btn" id="backToTop">← Ana Mekânlara Dön</button>
    <div class="selection-panel">
      <h2>${place.ad}</h2>
      <p>${place.ozet}</p>
    </div>
    <div class="section-title-wrap">
      <span class="mini-line"></span>
      <h2>İçindeki Türbelerin Listesi</h2>
    </div>
    <div class="turbe-grid">
      ${tombs
        .map(
          (tomb) => `
            <article class="turbe-card" data-tomb="${tomb.id}">
              <img class="turbe-cover" src="${tomb.gorsel}" alt="${tomb.baslik}">
              <div class="turbe-body">
                <h3>${tomb.baslik}</h3>
                <div class="location-row">
                  <span class="loc-pin"></span>
                  <span>${tomb.konum}</span>
                </div>
                <div class="turbe-sep"></div>
                <div class="turbe-text">${tomb.kisaAciklama}</div>
                <span class="read-more">Devam için tıklayınız.</span>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  document.getElementById("backToTop").addEventListener("click", () => {
    dynamicContent.innerHTML = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll("[data-tomb]").forEach((card) => {
    card.addEventListener("click", () => {
      const tomb = siteData.turbeler.find((item) => item.id === card.dataset.tomb);
      renderDetail(place, tomb);
    });
  });

  dynamicContent.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDetail(place, tomb) {
  dynamicContent.innerHTML = `
    <button class="back-btn" id="backToList">← Türbe Listesine Dön</button>
    <div class="detail-layout">
      <div class="detail-panel">
        <img src="${tomb.gorsel}" alt="${tomb.baslik}">
        <div class="detail-content">
          <h2>${tomb.baslik}</h2>
          <div class="place">${tomb.konum}</div>
          <p>${tomb.detay}</p>
        </div>
      </div>
      <div>
        <div class="text-box">
          <strong>Osmanlıca / Kitabe</strong>
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

  document.getElementById("backToList").addEventListener("click", () => renderTombList(place));
  dynamicContent.scrollIntoView({ behavior: "smooth", block: "start" });
}

loadData();
