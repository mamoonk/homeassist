<div align="center">

# ✨ Gloss Smart Dashboard

**A glassmorphic smart-mirror dashboard for wall displays, tablets, TVs, and desktops.**

Weather · Calendar · Stocks · Glucose · Prayer Times · World Clocks — all in one drag-and-drop grid.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=20232a)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=20232a)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=20232a)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=20232a)
![Zustand](https://img.shields.io/badge/Zustand-5-8D6748?style=for-the-badge&logo=react&logoColor=white&labelColor=20232a)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white&labelColor=20232a)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge&labelColor=20232a)

</div>

---

## 🚀 Quick start

```bash
git clone https://github.com/mamoonk/homeassist.git
cd homeassist
npm install
npm run dev        # → http://localhost:5173
```

**Windows one-click:** just double-click **`run.bat`** — it checks Node, installs dependencies on first launch, opens your browser, and starts the dev server.

---

## 🧩 Widgets

| | Widget | What it shows |
|---|---|---|
| 🌤️ | **Weather Header** | Location, temperature, condition + animated rain/snow/fog/thunder overlay |
| 📅 | **7-Day Forecast** | Scrollable day chips with highs & lows |
| 📈 | **Hourly Graph** | 24-hour temperature area chart with "now" marker |
| 🌡️ | **Temperature / Feels Like** | Gradient sliders between daily low & high |
| ☁️ | **Cloud Cover · Precipitation · Humidity** | Gauges and tube meters |
| 🧭 | **Wind** | SVG compass with Beaufort force scale |
| ☀️ | **UV Index** | 180° arc gauge, green → red |
| 🍃 | **Air Quality** | Live US AQI ring gauge (Open-Meteo air-quality API) |
| 👁️ | **Visibility · Pressure** | Correct units (miles / hPa) |
| 🌙 | **Moon** | Illumination %, next full moon, sunrise/sunset |
| 🕐 | **Clock** | Digital (DSEG segment font) or analog with **5 dial themes** |
| 🗓️ | **Calendar** | Month grid with US & Islamic holidays + Hijri dates (Arabic numerals) |
| 💹 | **Stocks** | Per-symbol cards, iOS-style watchlist, Bloomberg-ish 3-panel terminal |
| 🩸 | **Dexcom CGM** | Glucose circle, trend arrows, target-band chart (mock mode included) |
| 🏃 | **Health** | Daily steps, sleep, weight quick-entry |
| 🕌 | **Prayer Times** | 5 daily prayers, 12 calculation methods, auto-adhan playback |
| 🌍 | **World Clocks** | Up to 5 zones — click one to preview that city's weather everywhere |

---

## 🎨 Themes

| Theme | Vibe |
|---|---|
| 🌑 **Dark** | Slate glassmorphism (default) |
| ☀️ **Light** | Soft light panels |
| 🌗 **Circadian** | Light by day (06:00–20:59), dark by night — switches automatically |
| 🕹️ **Gamified** | Neon purple/indigo gradient with cyan glow |

Plus: adjustable glass translucency & blur, color/image backgrounds, content frosting, global font scale (0.5×–5×), and a **🪞 Smart Mirror mode** that streams your webcam full-screen behind white-glass widgets.

---

## 🔌 Data sources

| Source | Used for | Key needed? |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Forecast, geocoding, air quality | ❌ Free, no key |
| [Finnhub](https://finnhub.io) | Quotes, company profiles, candles | ✅ Free tier key |
| [Dexcom API v3](https://developer.dexcom.com) | CGM glucose readings | ✅ OAuth app (or use built-in mock) |
| [adhan](https://github.com/batoulapps/adhan-js) | Prayer time calculation | ❌ Local computation |

> 🔊 **Adhan audio:** drop `azan1.mp3` … `azan5.mp3` into `public/` (not bundled — licensing). The app degrades gracefully without them.

---

## 🛠️ Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server (with Dexcom sandbox proxy) |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run preview` | Serve the production build locally |
| `run.bat` | 🪟 Windows one-click launcher |

---

## 📁 Project layout

```
src/
├── components/      # Shell bars, analog clock face, grid system, modals
├── hooks/           # useWeather, useAzanPlayer, useNow, WeatherContext
├── pages/           # Home, Weather, Stocks, Calendar, Health, Settings
├── services/        # Open-Meteo, Finnhub, Dexcom, adhan, Hijri, holidays, moon
├── store/           # Zustand stores (settings, layouts, events, tasks, health)
└── widgets/         # Every dashboard widget
```

Everything persists **locally** in your browser (`localStorage`) — no backend, no accounts, no tracking.

---

## 📱 PWA

Installable as a standalone app — the service worker caches the app shell **network-first with cache fallback**, so it survives flaky connections on a wall-mounted display.

---

<div align="center">

Built from **[GLOSS-SPEC.md](GLOSS-SPEC.md)** — a full reverse-engineered functional specification — with all known bugs of the original fixed ✅

Made with 🧡 and an unhealthy number of widgets

</div>
