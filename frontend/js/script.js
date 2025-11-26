// console.log("Smart News Aggregator is ready!");
// // Left sidebar nav interactions
// (function(){
//   const navBtns = document.querySelectorAll('.nav-item');
//   navBtns.forEach(btn => {
//     btn.addEventListener('click', e => {
//       navBtns.forEach(b => b.classList.remove('active'));
//       btn.classList.add('active');
//       // optionally scroll to section if section ids exist
//       const target = btn.dataset.target;
//       const el = document.getElementById(target);
//       if (el) el.scrollIntoView({behavior:"smooth", block:"start"});
//     });
//   });

//   // Put a wrapper class on the main page content so it moves right.
//   // If your index.html's main wrapper doesn't have the class, add it:
//   // <div class="page-with-sidebar"> ... existing content ... </div>
// })();

// async function fetchNews() {
// const container = document.getElementById("news");
// container.innerHTML = "<p>Loading news...</p>";

// try {
//   const res = await fetch("http://localhost:5000/api/news");
//   const data = await res.json();
//   container.innerHTML = "";

//   // --- Score-based ranking ---
//   function scoreArticle(article) {
//     let score = 0;
//     if (article.urlToImage) score += 10;
//     if (article.title?.length > 40) score += 5;
//     const majorSources = ["BBC", "CNN", "Reuters", "The Guardian", "Al Jazeera"];
//     if (majorSources.some(src => article.source?.name?.includes(src))) score += 15;
//     return score;
//   }

//   // Sort by score
//   const sortedArticles = data.articles.sort((a, b) => scoreArticle(b) - scoreArticle(a));
//   // Hero = first one
//   const heroArticle = sortedArticles[0];
//   const otherArticles = sortedArticles.slice(1);

//   // --- Create Hero Card ---
//   const heroCard = document.createElement("div");
//   heroCard.className = "news-card hero";

//   heroCard.innerHTML = `
//     <img src="${heroArticle.urlToImage || ''}">
//     <div class="content">
//       <div class="meta">
//         <span class="source">${heroArticle.source?.name || "Unknown"}</span>
//         <span class="time">${new Date(heroArticle.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
//       </div>
//       <h1>${heroArticle.title}</h1>
//       <p>${heroArticle.description || ''}</p>
//       <a class="read-btn" href="${heroArticle.url}" target="_blank">Read more</a>
//     </div>
//   `;

//   container.appendChild(heroCard);
//   // --- Other Smaller Cards ---
//   otherArticles.forEach(article => {
//     const card = document.createElement("div");
//     card.className = "news-card";

//     card.innerHTML = `
//       ${article.urlToImage ? `<img src="${article.urlToImage}">` : ""}
//       <div class="content">
//         <div class="meta">
//           <span class="source">${article.source?.name || "Unknown"}</span>
//           <span class="time">${new Date(article.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
//         </div>
//         <h2>${article.title}</h2>
//         <p>${article.description || ''}</p>
//         <a class="read-btn" href="${article.url}" target="_blank">Read more</a>
//       </div>
//     `;
//     container.appendChild(card);
//   });

//   } catch (err) {
//     console.error(err);
//     container.innerHTML = "<p>Failed to fetch news.</p>";
//   }
//   // --- Generate Picks for You ---
//   function generatePicks(articles) {
//     const picksContainer = document.getElementById("picks");
//     picksContainer.innerHTML = "";

//     // Randomly shuffle and pick 3 articles
//     const picks = articles
//       .sort(() => 0.5 - Math.random())
//       .slice(0, 3);

//     picks.forEach(article => {
//       const pickDiv = document.createElement("div");
//       pickDiv.className = "pick-card";

//       const img = article.urlToImage ? `<img src="${article.urlToImage}">` : "";

//       pickDiv.innerHTML = `
//         ${img}
//         <h4>${article.title}</h4>
//       `;

//       pickDiv.onclick = () => window.open(article.url, "_blank");
//       picksContainer.appendChild(pickDiv);

//     });
//   }

//   // Call after rendering main news:
//   generatePicks(data.articles);

// }


//   fetchNews();

// js/script.js
// Smart News Aggregator - Frontend controller
// - Save as js/script.js (or the same path referenced by your index.html)

console.log("Smart News Aggregator is ready!");

// --- Helper utilities --------------------------------
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

// Score article to detect "top/trending" (simple heuristic)
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

// --- DOM helpers to render markup -------------------
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

// Picks rendering: random unique picks (3)
function renderPicks(articles = []) {
  const picksContainer = document.getElementById("picks");
  if (!picksContainer) return;
  picksContainer.innerHTML = "";

  // shuffle copy without mutating original
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

// --- Main fetch + render flow -----------------------
async function fetchNews() {
  const container = document.getElementById("news");
  if (!container) {
    console.error("Missing #news container in DOM.");
    return;
  }
  container.innerHTML = "<p>Loading news...</p>";

  try {
    const res = await fetch("http://localhost:5000/api/news");
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();

    if (!data || !Array.isArray(data.articles)) {
      container.innerHTML = "<p>No articles returned.</p>";
      return;
    }

    // Defensive: ensure we have distinct array
    const articles = Array.from(data.articles);

    // sort by score (non-mutating copy)
    const sorted = articles.slice().sort((a, b) => scoreArticle(b) - scoreArticle(a));

    // choose hero as highest-scored
    const hero = sorted[0];
    const others = sorted.slice(1);

    // clear and render
    container.innerHTML = "";

    if (hero) {
      container.appendChild(createHeroCard(hero));
    }

    // render the rest (as small cards)
    others.forEach(article => {
      container.appendChild(createSmallCard(article));
    });

    // render picks (random) once
    renderPicks(articles);
  } catch (err) {
    console.error("Failed to fetch news:", err);
    container.innerHTML = "<p>Failed to fetch news.</p>";
  }
}

// --- Sidebar nav behavior (keeps your previous logic) ---
(function initNav() {
  const navBtns = document.querySelectorAll('.nav-item');
  navBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      if (target) {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();

// run once DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  fetchNews();
});
/* ---------- Header: live datetime + mini-weather ---------- */

function startDateTimeClock() {
  const el = document.getElementById("current-datetime");
  if (!el) return;

  function update() {
    // Example format: "Sunday, 23 Nov 2025 · 11:23 AM"
    const now = new Date();
    const dateStr = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(now);
    const timeStr = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit"
    }).format(now);
    el.textContent = `${dateStr} · ${timeStr}`;
  }

  update();
  // update every 30s (minute resolution important)
  setInterval(update, 30 * 1000);
}

/*
  Fetch current weather using Open-Meteo (no API key).
  Uses browser geolocation if allowed; otherwise falls back to Islamabad.
*/
async function loadCityWeather() {
  const weatherBox = document.getElementById("city-weather");
  if (!weatherBox) return;

  const setWeather = (city, tempC, note = "") => {
    weatherBox.querySelector(".city-name").textContent = city;
    weatherBox.querySelector(".city-temp").textContent = `${Math.round(tempC)}°C`;
    weatherBox.querySelector(".weather-note").textContent = note;
  };

  // fallback coordinates (Islamabad)
  const fallback = { lat: 33.6844, lon: 73.0479, city: "Islamabad" };

  // helper: call Open-Meteo
  async function fetchWeather(lat, lon) {
    try {
      // request current weather (celsius)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`;
      const r = await fetch(url);
      if (!r.ok) throw new Error("weather fetch failed");
      const j = await r.json();
      const t = j?.current_weather?.temperature;
      const wCode = j?.current_weather?.weathercode;
      const note = t !== undefined ? `Now • ${t.toFixed(0)}°C` : "";
      return { temp: t, note: note, raw: j };
    } catch (err) {
      return null;
    }
  }

  // Try browser geolocation
  if (navigator.geolocation) {
    // show loading note
    weatherBox.querySelector(".weather-note").textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      // optional: reverse geocode to city (skip external services) — we will use coords only
      const result = await fetchWeather(lat, lon);
      if (result && result.temp !== undefined) {
        setWeather("Your city", result.temp, result.note);
      } else {
        // fallback
        const fb = await fetchWeather(fallback.lat, fallback.lon);
        if (fb) setWeather(fallback.city, fb.temp, "Using fallback");
        else {
          weatherBox.querySelector(".weather-note").textContent = "Weather unavailable";
        }
      }
    }, async (err) => {
      // permission denied or error — fallback
      weatherBox.querySelector(".weather-note").textContent = "Using fallback";
      const fb = await fetchWeather(fallback.lat, fallback.lon);
      if (fb) setWeather(fallback.city, fb.temp, "Using fallback");
      else weatherBox.querySelector(".weather-note").textContent = "Weather unavailable";
    }, { maximumAge: 600000, timeout: 8000 });
  } else {
    // no geolocation API
    weatherBox.querySelector(".weather-note").textContent = "No geolocation";
    const fb = await (async () => {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${fallback.lat}&longitude=${fallback.lon}&current_weather=true&temperature_unit=celsius`);
        const j = await r.json();
        return { temp: j?.current_weather?.temperature };
      } catch { return null; }
    })();
    if (fb?.temp !== undefined) setWeather(fallback.city, fb.temp, "Using fallback");
  }
}

// Init header functions on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  startDateTimeClock();
  loadCityWeather();
});
