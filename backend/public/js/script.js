console.log("Smart News Aggregator is ready!");

// --- Helper functions ---
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function timeAgo(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

function scoreArticle(article = {}) {
  let score = 0;
  if (article.urlToImage) score += 10;
  if (article.title && article.title.length > 40) score += 5;
  const majorSources = ["BBC", "CNN", "Reuters", "The Guardian", "Al Jazeera"];
  if (article.source && article.source.name) {
    if (majorSources.some(s => article.source.name.includes(s))) score += 15;
  }
  return score;
}

// --- Render functions ---
function createHeroCard(article) {
  const div = document.createElement("div");
  div.className = "news-card hero";

  const imgSrc = article.urlToImage || "";
  const title = escapeHtml(article.title || "");
  const desc = escapeHtml(article.description || "");
  const source = escapeHtml(article.source?.name || "Unknown");
  const published = timeAgo(article.publishedAt);

  div.innerHTML = `
    ${imgSrc ? `<img src="${imgSrc}" alt="${title}" loading="lazy">` : ''}
    <div class="content">
      <div class="meta">
        <span class="source">${source}</span>
        <span class="time">${published}</span>
      </div>
      <h1>${title}</h1>
      ${desc ? `<p>${desc}</p>` : ''}
      <a class="read-btn" href="${article.url}" target="_blank" rel="noopener noreferrer">Read more</a>
    </div>
  `;
  return div;
}

function createSmallCard(article) {
  const div = document.createElement("div");
  div.className = "news-card";

  const imgSrc = article.urlToImage || "";
  const title = escapeHtml(article.title || "");
  const desc = escapeHtml(article.description || "");
  const source = escapeHtml(article.source?.name || "Unknown");
  const published = timeAgo(article.publishedAt);

  div.innerHTML = `
    ${imgSrc ? `<img src="${imgSrc}" alt="${title}" loading="lazy">` : `<div class="placeholder-img">No Image</div>`}
    <div class="content">
      <div class="meta">
        <span class="source">${source}</span>
        <span class="time">${published}</span>
      </div>
      <h2>${title}</h2>
      ${desc ? `<p>${desc}</p>` : ''}
      <a class="read-btn" href="${article.url}" target="_blank" rel="noopener noreferrer">Read more</a>
    </div>
  `;
  return div;
}

function renderPicks(articles = []) {
  const picksContainer = document.getElementById("picks");
  if (!picksContainer) return;
  picksContainer.innerHTML = "";

  const copy = [...articles];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  const picks = copy.slice(0, 3);

  picks.forEach(a => {
    const imgHtml = a.urlToImage ? `<img src="${a.urlToImage}" alt="${escapeHtml(a.title || '')}" loading="lazy">` : '';
    const safeTitle = escapeHtml(a.title || "Untitled");

    const card = document.createElement("div");
    card.className = "pick-card";
    card.innerHTML = `
      ${imgHtml}
      <h4>${safeTitle}</h4>
      <a href="${a.url}" target="_blank" rel="noopener noreferrer">Open</a>
    `;
    card.addEventListener("click", () => window.open(a.url, "_blank"));
    picksContainer.appendChild(card);
  });
}

// --- Fetch news ---
async function fetchNews(value, type = "category") {
  const container = document.getElementById("news");
  if (!container) return;

  container.innerHTML = "<p>Loading news...</p>";

  try {
    const res = await fetch(`http://localhost:5000/api/news?${type}=${encodeURIComponent(value)}`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();

    if (!data || !Array.isArray(data.articles)) {
      container.innerHTML = "<p>No articles returned.</p>";
      return;
    }

    const articles = Array.from(data.articles);
    const sorted = articles.slice().sort((a, b) => scoreArticle(b) - scoreArticle(a));

    container.innerHTML = "";
    if (sorted[0]) container.appendChild(createHeroCard(sorted[0]));
    sorted.slice(1).forEach(article => container.appendChild(createSmallCard(article)));

    renderPicks(articles);
  } catch (err) {
    console.error("Failed to fetch news:", err);
    container.innerHTML = "<p>Failed to fetch news.</p>";
  }
}

// --- Sidebar nav ---
(function initNav() {
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const categoryMap = {
        "home": { type: "category", value: "general" },
        "for you": { type: "category", value: "general" },
        "following": { type: "category", value: "general" },
        "politics": { type: "q", value: "politics" },
        "world": { type: "q", value: "world" },
        "local": { type: "q", value: "pakistan" },
        "business": { type: "category", value: "business" },
        "technology": { type: "category", value: "technology" },
        "entertainment": { type: "category", value: "entertainment" },
        "sports": { type: "category", value: "sports" },
        "science": { type: "category", value: "science" },
        "health": { type: "category", value: "health" }
      };

      const key = btn.textContent.trim().toLowerCase();
      const config = categoryMap[key] || { type: "category", value: "general" };

      fetchNews(config.value, config.type);
    });
  });
})();

// --- Search functionality ---
(function initSearch() {
  const searchInput = document.getElementById("sidebarSearch");
  if (!searchInput) return;

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (!query) return;

      // Remove active class from all sidebar nav buttons
      document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));

      // Fetch news by keyword
      fetchNews(query, "q");
    }
  });
})();


// --- Header datetime ---
function startDateTimeClock() {
  const el = document.getElementById("current-datetime");
  if (!el) return;

  function update() {
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(now);
    const timeStr = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(now);
    el.textContent = `${dateStr} · ${timeStr}`;
  }
  update();
  setInterval(update, 30 * 1000);
}

async function loadCityWeather() {
  const weatherBox = document.getElementById("city-weather");
  if (!weatherBox) return;

  const setWeather = (city, tempC, note = "") => {
    weatherBox.querySelector(".city-name").textContent = city;
    weatherBox.querySelector(".city-temp").textContent = `${Math.round(tempC)}°C`;
    weatherBox.querySelector(".weather-note").textContent = note;
  };

  const fallback = { lat: 33.6844, lon: 73.0479, city: "Islamabad" };

  async function fetchWeather(lat, lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`;
      const r = await fetch(url);
      const j = await r.json();
      const t = j?.current_weather?.temperature;
      return { temp: t, note: t !== undefined ? `Now • ${t.toFixed(0)}°C` : "" };
    } catch {
      return null;
    }
  }

  if (navigator.geolocation) {
    weatherBox.querySelector(".weather-note").textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const result = await fetchWeather(lat, lon);
      if (result && result.temp !== undefined) {
        setWeather(`Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`, result.temp, result.note);
      } else {
        const fb = await fetchWeather(fallback.lat, fallback.lon);
        if (fb) setWeather(fallback.city, fb.temp, "Using fallback");
        else weatherBox.querySelector(".weather-note").textContent = "Weather unavailable";
      }
    }, async () => {
      const fb = await fetchWeather(fallback.lat, fallback.lon);
      if (fb) setWeather(fallback.city, fb.temp, "Using fallback");
    }, { maximumAge: 600000, timeout: 8000 });
  } else {
    const fb = await fetchWeather(fallback.lat, fallback.lon);
    if (fb) setWeather(fallback.city, fb.temp, "Using fallback");
  }
}

// --- Init ---
window.addEventListener("DOMContentLoaded", () => {
  startDateTimeClock();
  loadCityWeather();
  fetchNews("general");
});
