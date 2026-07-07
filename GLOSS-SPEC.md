# Gloss Smart Dashboard — Complete Functional Specification
### Reverse-engineered from the `gloss` repository (React 19 + Vite 7 + TypeScript)

This document captures **every feature, behavior, and minor detail** of the Gloss Smart Dashboard so the app can be faithfully duplicated. Pair it with `GLOSS-Rebuild-Prompt.md`, which packages this spec into a ready-to-use build prompt with an enhanced UI design brief.

---

## 1. What the app is

A single-page **smart dashboard / smart-mirror UI** intended for wall displays, tablets, TVs, and desktops. It combines weather, calendar & tasks, stocks, health (Dexcom CGM), Islamic prayer times with adhan audio, world clocks, and news in a fully customizable drag-and-drop widget layout, with glassmorphism, four themes (including a time-of-day "circadian" theme and a neon "gamified" theme), optional webcam "Smart Mirror" background, and PWA installability.

## 2. Tech stack (exact)

| Concern | Library | Version |
|---|---|---|
| UI framework | React + React DOM | ^19.2.4 |
| Language | TypeScript (strict, `verbatimModuleSyntax`, `erasableSyntaxOnly`) | ~5.9.3 |
| Build | Vite + @vitejs/plugin-react | ^7.3.1 |
| Routing | react-router-dom (BrowserRouter) | ^7.13.0 |
| State | zustand (+ `persist` middleware → localStorage) | ^5.0.11 |
| Styling | Tailwind CSS 3 + PostCSS + Autoprefixer | ^3.4.19 |
| Widget grid | react-grid-layout (`ResponsiveGridLayout`, `useContainerWidth`) | ^2.2.2 |
| Charts | recharts (^3.7.0); lightweight-charts ^5.1.0 is a dependency but unused in code |
| Dates | dayjs (+ utc, timezone plugins) | ^1.11.19 |
| Prayer times | adhan | ^4.4.3 |
| Hijri calendar | @tabby_ai/hijri-converter (Umm al-Qura, valid 1343–1500 AH) | ^1.0.5 |
| Segment fonts | @fontsource/dseg7-classic, @fontsource/dseg14-classic (400 + 700) | ^5.2.5 |
| Web font | Inter 400/700 via Google Fonts `<link>` in index.html | — |

External APIs (all called directly from the browser):
- **Open-Meteo Forecast** `https://api.open-meteo.com/v1/forecast` — no key.
- **Open-Meteo Geocoding** `https://geocoding-api.open-meteo.com/v1/search` — no key.
- **Finnhub** `https://finnhub.io/api/v1` — `/quote`, `/stock/profile2`, `/stock/candle` — free API key required.
- **Dexcom API v3** — sandbox/US/EU/JP origins; in dev, sandbox is proxied by Vite at `/dexcom-api` → `https://sandbox-api.dexcom.com` to dodge CORS.

Tooling extras: `Launch.bat` (Windows one-click: checks Node, `npm install`, opens `http://localhost:5173` after 4 s, runs `npm run dev`); `npm run build` = `tsc && vite build`.

## 3. App shell (`App.tsx`, `main.tsx`, `index.html`)

- Root div id is **`app`** (not `root`). React `StrictMode`. Service worker `/sw.js` registered on window load, failures swallowed.
- **index.html**: viewport `width=device-width, initial-scale=1.0, viewport-fit=cover`; `theme-color` meta `#1e293b`; manifest link; Google Fonts preconnect + Inter.
- **Shell layout, top to bottom**: `WorldClocksBar` → `PrayerTimesBar` → `TabBar` → `<main class="flex-1 overflow-auto">` with routes. Whole shell is `min-h-screen flex flex-col`; text color `text-slate-900` on light, `text-white` otherwise.
- **Routes**: `/` Home, `/weather`, `/stocks`, `/calendar`, `/health`, `/settings`.
- **Global font scale**: root wrapper has `fontSize: fontScale*100%` (fontScale persisted, 0.5–5).
- **Themes**: `light | dark | circadian | gamified`. Circadian resolves to light between **06:00 and 20:59** local, else dark, re-evaluated every 60 s. Effective theme written to `<html data-theme="...">` and to the `theme-color` meta (`light #f1f5f9`, `dark #1e293b`, `gamified #1a0a2e`).
- **Glassmorphism**: two CSS custom properties on `<html>` — `--glass-opacity` (0.2–0.9, default 0.5) and `--glass-blur` (`0|4|8|12` px, default 8). Panels use class `.glass-panel` = `rgba(30,41,59,var(--glass-opacity))` + `backdrop-filter: blur(var(--glass-blur))`. Light theme overrides glass to `rgba(248,250,252,…)` and re-tints slate utility classes via attribute-scoped CSS. Gamified theme replaces glass with a purple→indigo gradient, cyan border `rgba(34,211,238,.35)`, cyan glow shadow, and neon text/input overrides.
- **Background**: type `color` (default `#0f172a`) or `image` (URL, `cover/center/no-repeat`, color as fallback). Gamified with default color uses gradient `linear-gradient(160deg,#1a0a2e 0%,#0f172a 40%,#0c0a1a 100%)`. Default light bg `#f1f5f9`.
- **Content blur**: optional 0–24 px `backdrop-filter` over an inner wrapper (plus `rgba(15,23,42,.15)` tint) so content is frosted while the background stays sharp. Disabled while Smart Mirror is on.
- **Smart Mirror**: when enabled, a fixed full-screen `<video>` (muted, playsInline, `object-fit: cover`, `scaleX(-1)` mirror flip, `z-index:0`) streams `getUserMedia({video})` — with `deviceId: {exact}` if a camera is chosen — and the app background goes transparent; content wrapper gets `z-index:1`. CSS `[data-smart-mirror="true"]` forces every grid item to white-glass (`rgba(255,255,255,var(--glass-opacity,0.1))`, blur, `1px rgba(255,255,255,.2)` border). Stream tracks are stopped on unmount/device change.
- **Weather auto-refresh**: `useWeather(2h)` runs at shell level, so every widget shares one fetch.
- **Adhan scheduler**: `useAzanPlayer()` runs at shell level (see §9).
- **Touch/TV base CSS**: all `button`, `a[href]`, `[role="button"]` get min 44×44 px; 48×48 on `(pointer: coarse)`. `text-size-adjust: 100%`.

## 4. Persistent top bars

### 4.1 WorldClocksBar
- Rendered only if `worldClocksEnabled` (default **false**). Row of up to **5** zone buttons (`zones.slice(0,5)`), wrap+centered, bar `fontSize: clockScale rem` (0.5–5).
- Ticks every 1 s (dayjs + utc/timezone plugins).
- Per zone: label above (city name), then **digital** time `h:mm:ss A` in **DSEG14 Classic bold** tabular-nums, or **analog** `AnalogClockFace` (3.5em) with tiny digital time underneath, depending on `clockDisplayType` (default digital). Analog respects `clockWidgetShowHourNumbers` and `clockWidgetDialStyle`.
- Label resolution: `worldClockCityDetails[zone].name` (saved when added via city search) → hardcoded table (`Europe/Copenhagen`→"Esbjerg", `Australia/Sydney`→"Sydney") → last path segment of the IANA id with `_`→space.
- **Click a clock** = toggle a global **weather location override** (`{lat, lon, name, zoneId}` in dataStore). All weather widgets then show that city; clicking the same clock again clears it. Coordinates come from saved city details or from a hardcoded table of ~24 common zones (`TIMEZONE_LOCATIONS`; note `UTC` maps to London). Selected clock gets amber border/ring/background; clocks without a known location are disabled.
- Default zones: `America/New_York, Europe/London, Asia/Tokyo, Asia/Dubai, UTC`.

### 4.2 PrayerTimesBar
- Rendered only if `azanEnabled` (default false). Bar `fontSize: prayerTimesScale rem`. Ticks every 1 s; recomputes today's times from adhan lib each tick.
- Shows 5 pill chips — Fajr, Dhuhr, Asr, Maghrib, Isha with `h:mm A` — plus a status chip: `Now: <current> until <next time> · Next: <next> <time> (<countdown Xh Ym or Xm>)`; if before Fajr/after Isha shows `Next: Fajr tomorrow`.
- **Current** prayer chip: amber (border-amber-500/50, bg-amber-500/25, semibold amber text). **Next**: emerald. Others: slate. Horizontal scroll if overflowing.

### 4.3 TabBar
- NavLinks: `Home Dashboard, Weather, Stocks, Calendar & Events, Health` left-aligned; `Settings` pushed right with `ml-auto`. Active = `bg-amber-500/20 text-amber-400`; inactive slate with hover. Glass panel, bottom border, horizontal scroll on overflow.

## 5. Widget grid system (`WidgetGrid.tsx`)

- react-grid-layout `ResponsiveGridLayout` with **breakpoints `{lg:1200, md:996, sm:768}`**, **cols `{lg:12, md:10, sm:6}`**, **rowHeight 80**, margin `[12,12]`, containerPadding `[12,12]`, drag + resize enabled, width via `useContainerWidth({initialWidth:1200})` (grid renders only after `mounted`).
- Every grid item wrapper: `group relative overflow-hidden rounded-lg glass-panel shadow-lg` **with CSS container queries enabled**: `[container-type:size] [container-name:widget]` — widgets size internals with `cqmin/cqw` units.
- **Home tab**: shows an optional **WidgetPalette** bar ("Add or remove from dashboard:") listing every registered widget as an amber "Label +" add-chip or a slate chip + red "−" remove button. Adding computes default size — **large widgets (`calendar`, `dexcom`, `stocks`) = 4×4**, everything else **2×2** — placed at `x=(count*2)%12`, `y=floor(count/6)*2`, same layout item copied to lg/md/sm. If `dashboardAutoArrange` is on, `autoArrangeHome()` runs after add (packs all as uniform 2×2 tiles per breakpoint, `itemsPerRow = floor(cols/2)`).
- Each home item shows an **× remove button** on hover (top-right, appears via `group-hover:opacity-100`, red hover). Removing `calendar`/`dexcom`/`stocks` also flips their "show on dashboard" setting off (two-way sync; HomePage effects also add/remove when the setting toggles).
- Layout changes persist per tab per breakpoint (`gloss-layouts`). Non-home tabs merge saved items over provided default layouts by item id; home reconciles `homeWidgetIds` (plus setting-driven ids) against saved layouts, generating defaults for missing items.
- Unknown widget id renders a fallback `Widget: <id>` panel.

## 6. Widget registry (all widget ids)

`weather-header, weather-minimap, weather-forecast, weather-hourly-graph, weather-temperature, weather-feels-like, weather-cloud-cover, weather-precipitation, weather-wind, weather-humidity, weather-uv, weather-aqi, weather-visibility, weather-pressure, weather-moon, stock (dynamic: id "stock-<SYMBOL>"), stocks (watchlist list), stocks-dashboard (Finnhub terminal), calendar, health, azan, dexcom, clock, news`.

`WidgetCard` common wrapper: `p-3` column, optional tiny uppercase slate title (`text-xs font-medium uppercase tracking-wide text-slate-400`), optional centered body.

## 7. Weather

### 7.1 Fetch & transform (`services/weather.ts`, `hooks/useWeather.ts`)
- Request params: `current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,uv_index,is_day`; `hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation`; `daily=weather_code,temperature_2m_max,temperature_2m_min`; `timezone=auto`; `temperature_unit` from settings (default fahrenheit); `wind_speed_unit=mph` always; `precipitation_unit=inch` always.
- WMO weather-code → label map (24 codes: Clear, Mainly clear, Partly cloudy, Overcast, Foggy, Depositing rime fog, Light drizzle, Drizzle, Dense drizzle, Slight rain, Rain, Heavy rain, Slight/Snow/Heavy snow, Snow grains, rain-shower trio, snow-shower pair, Thunderstorm, +hail variants; unknown → "Unknown").
- Transform keeps first **24 hourly** points and all daily days; `visibility ?? 10`, `uvIndex ?? 0`, `dewPoint` hardcoded 0, `aqi` always `undefined` (never fetched — the AQI widget therefore permanently shows "No data (enable in API)"). `fetchedAt = Date.now()`.
- Hook refetches on location/units change and every `refetchIntervalMs` (2 h from App); failure sets weather to `null`. Location = override (from world-clock click) else settings location. Default location: **Morrisville, NC (35.8235, −78.8256)**.

### 7.2 Weather widgets (behavior details)
- **Header**: location name, big amber temp `text-3xl` + 40 px condition icon, condition text, "Feels like X°", "The high will be X°." from daily[0]; when a world-clock override is active, a footnote "Showing <city>. Click that world clock again to return to your location." A `WeatherEffectsOverlay` renders behind content.
- **Effects overlay** (also usable anywhere): condition string → effect: thunderstorm | fog (incl. "rime") | heavy_snow | snow | drizzle | rain (also plain "showers"). Rain/drizzle = 55/28 one-px diagonal (−12°) streaks with staggered delays/durations falling via `rain-fall` keyframes; thunderstorm = rain + dark top gradient; snow/heavy snow = 45/85 round flakes with sinusoidal horizontal drift via `--snow-drift` custom property (`snow-fall` keyframes, heavy = bigger/faster/denser); fog = pulsing radial white gradient (`fog-pulse` 8 s). `pointer-events-none`, deterministic pseudo-random placement from index math (no RNG).
- **Mini map**: placeholder card "Open map (optional tile layer)".
- **Daily forecast**: horizontally scrollable row of up to 7 day chips (weekday short name, icon, amber high, slate low); whole widget scales with `clamp(0.5rem, 4cqw, 1.5rem)` container-query font sizing.
- **Hourly graph**: recharts AreaChart of 24 h temps; amber line `#f59e0b` w2 with amber→transparent gradient fill; dashed slate grid; dark slate tooltip; amber dashed cursor; a `ReferenceDot` marks hovered point, else the "now" point (±30 min match); 800 ms ease-out entry animation; fixed 180 px height.
- **Temperature**: big amber value, `TempSlider` (blue→amber gradient track + amber-ringed thumb) positioned between low/high (daily min/max padded ±2, fallback ±5), "High X° · Low X°".
- **Feels like**: value + slider between min/max of (feelsLike, temp) ±3, comfort label `Warmer / Colder / Comfortable` (±2° band), "Temperature X°" footnote.
- **Cloud cover**: `CloudIcon` (opacity 0.3+pct·0.7), label `Clear <25 / Partly cloudy <75 / Cloudy`, sub-caption "Mostly clear sky / Mixed clouds / Mostly cloudy sky".
- **Precipitation**: rain icon (50% opacity when 0), `X.XX in`, "next 24h · Precipitation expected/No precipitation".
- **Wind**: SVG compass (N/E/S/W labels, amber needle+dot rotated to bearing), "From <16-point dir> (deg°)", speed mph, "Force N (Beaufort)" using thresholds 1/4/8/13/19/25/32 mph → 0–7.
- **Humidity**: vertical gradient tube gauge (sky-blue), %, label `Low <30 / Normal <60 / High`.
- **UV**: 180° arc gauge with green→lime→yellow→orange→red gradient, needle+dot, value to 1 decimal, label Low ≤2 / Moderate ≤5 / High ≤7 / Very high ≤10 / Extreme.
- **AQI**: circular ring gauge max 200 with EPA-ish colors (≤50 green Good, ≤100 yellow Moderate, ≤150 orange "Unhealthy for sensitive", else red Unhealthy). Currently always the no-data state (see §7.1).
- **Visibility**: eye icon, `X.X mi` (values ≥1000 shown as `X.Xk mi` — an artifact of Open-Meteo returning meters/feet while the UI assumes miles), label Excellent ≥10 / Good ≥5 / Fair ≥2 / Poor.
- **Pressure**: up/down arrow (rotates 180° when falling; "rising" = value ≥ 1010), value `.toFixed(2)` labeled **"in"** although the API returns hPa (known unit bug), Rising/Falling caption, slider over fixed 980–1040 range.
- **Moon**: illumination % from a synodic-cycle cosine approximation anchored at the 2000-01-06 18:14 UTC new moon (29.530588 d); "Next full moon <MMM D>"; sunrise/sunset row reusing adhan's Sunrise and Maghrib times for the weather location. Icon = circle with a clipped dark overlay proportional to phase.

## 8. Clock

- **AnalogClockFace** (shared by widget + world clocks): 48×48 viewBox SVG; radial-gradient face, linear-gradient bezel ring with drop shadow, 60 minor ticks (unless style hides), 12 major ticks **only when hour numbers are off**, optional 1–12 numerals (font-size 4, positioned at tick radius), smoothly-angled hour/minute hands (hour includes minute+second fractions), stepping second hand, two-circle center cap. **Five dial themes**: 1 Classic (dark slate, amber second hand), 2 Minimal (light silver), 3 Navy (navy+royal blue bezel, gold `#d4af37` accents), 4 Warm (cream/parchment + brown/bronze), 5 High contrast (white face, black ticks/hands, red second hand). Unique gradient ids via `useId()`.
- **ClockWidget** (local time, 1 s tick): analog mode = dial sized `min(72cqmin,100%)` square + DSEG14 time below (`h:mm:ss A`); digital mode = DSEG14 bold time + uppercase date `dddd, MMM D, YYYY`, font `min(1.25rem, 8cqmin)` so it fits any tile size.
- Settings: display type (default digital), show hour numbers (default true), dial style (default 1).

## 9. Prayer times & adhan (`services/azan.ts`, `azanAudio.ts`, `useAzanPlayer.ts`)

- adhan lib `PrayerTimes` with **explicit parameter table overriding defaults** for: MuslimWorldLeague 18/17, NorthAmerica (ISNA) 15/15, UmmAlQura 18.5 + **90-min Isha interval**, Egyptian 19.5/17.5, Karachi 18/18, Turkey 18/17. Other selectable methods fall back to the library presets: Dubai, Qatar, Kuwait, MoonsightingCommittee, Singapore, Tehran. Unknown → MuslimWorldLeague.
- `getPrayerTimes` returns Fajr, **Sunrise**, Dhuhr, Asr, Maghrib, Isha; helpers filter to the 5 prayers, compute current (last ≤ now) and next (first > now).
- **Audio**: 5 local files `public/azan1.mp3 … azan5.mp3` (repo ships all 5). Per-prayer sound selection map (`azanByPrayer`, defaults all 1) with global `azanChoice` fallback; volume 0–1 (default 0.8).
- **Auto-play scheduler**: when `azanEnabled && playAzanAtPrayerTime`, checks every **15 s**; if now is within **0–120 s after** a prayer time and that (date, prayer) hasn't fired yet, plays that prayer's chosen file once (a ref guards concurrent playback; last-played ref prevents repeats).
- Settings section additionally offers per-prayer **Play/Stop preview** buttons (stop pauses + rewinds) and a read-only "Today's prayer times" strip.

## 10. Calendar & tasks

### 10.1 Storage (`services/storage.ts`)
localStorage JSON under `gloss-calendar-events`, `gloss-calendar-tasks`, `gloss-health-metrics`. Events `{id, title, start (YYYY-MM-DD or ISO w/ T), end?, allDay?, color?}`; ids like `ev-<timestamp>-<rand36>`. Tasks `{id, title, done}`. Health `{id, date, steps?, sleepHours?, weight?, notes?}`. All-day inferred when `start` has no `T`.

### 10.2 Holidays (`services/holidays.ts`)
- **US federal** computed per year: New Year's, MLK (3rd Mon Jan), Presidents' (3rd Mon Feb), Memorial (last Mon May), Juneteenth 6/19, Independence 7/4, Labor (1st Mon Sep), Columbus (2nd Mon Oct), Veterans 11/11, Thanksgiving (4th Thu Nov), Christmas 12/25 — fixed-date ones get **weekend observance shifting** (Sat→Fri, Sun→Mon).
- **Islamic** from a hardcoded table for 2024–2030: Islamic New Year, Mawlid an-Nabi, Eid al-Fitr, Eid al-Adha (approximate Gregorian dates).
- Synthetic ids `holiday-us-YYYY-MM-DD` / `holiday-islamic-<date>`; never persisted; **read-only** everywhere (not editable, deletable, or draggable).

### 10.3 Hijri (`services/hijri.ts`)
Gregorian→Hijri via Umm al-Qura converter; English month names (Muharram … Dhu al-Hijjah); `toArabicDigits` renders day numbers in Arabic-Indic ٠١٢٣٤٥٦٧٨٩; out-of-range conversion returns null gracefully.

### 10.4 CalendarPage (full page)
- Hero header: "Calendar & Events", tagline "All in one place — stay on the same page.", big amber **+ Add event** button (uses `prompt()` dialogs for title then date).
- **Today** section: event cards (title, `ddd, MMM D · h:mm A` or "All day", × delete; click body to edit; holidays read-only) or dashed empty state.
- **Month grid**: Prev/Next month controls; header shows `MMMM YYYY` (+ ` / <Hijri month> <year> AH` when enabled); 7-col grid, Sun-first, `Sun..Sat` headers; each day cell shows number (+ small Arabic Hijri day when enabled), a hover **+** inline-add (input + Add/Cancel micro-form, Enter submits, all-day event on that date), and event titles list. Today cell amber-tinted with ring; other-month cells dimmed.
- **Drag & drop**: events (non-holiday) are `draggable`; drop target day gets an amber ring during dragover; drop moves the event to that date **preserving its time-of-day** if it had one (MIME `application/x-gloss-event-id`).
- **Edit modal**: overlay (click-outside closes), Title, Date, All-day checkbox, Time (hidden when all-day), Cancel/Save; save composes `date` or `dateThh:mm:00`.
- **Upcoming**: next 7 events from today (excluding today's) as compact cards.
- **Tasks**: input + Add (Enter works; empty input falls back to `prompt()`), circular check toggle (emerald when done, strikethrough), × delete.

### 10.5 CalendarWidget (dashboard)
Compact month grid with the same holiday/Hijri options; header `←  MMMM YYYY [/ Hijri] [(today's holiday names)]  →` plus a **Today** button that appears only when not viewing the current month; single-letter weekday row; per-day tiny event list (scrollable). Font scales via `calendarScale` setting; container-query sized. Reads events **once on mount** (does not live-sync with the full page).

## 11. Stocks

- **StockWidget** (`stock-<SYM>`, used on the Stocks page for each watchlist symbol): quote (price bold, change + % in emerald/red) and a 30-day daily-close line mini-chart (color follows sign) with tooltip. No key → "Configure API key in Settings"; failures → "Unable to load".
- **StocksListWidget** (`stocks`, iOS-Stocks-style): header "Stocks" + long date + **Edit** link to /settings; rows for up to 12 watchlist symbols — symbol, company name from `/stock/profile2`, 30-day sparkline area chart, price, change badge (solid emerald/red pill). Scales via `stocksScale`.
- **FinnbubDashboardWidget** (`stocks-dashboard`, the Stocks page hero — note the intentional(?) misspelling "Finnbub" in the filename): a Bloomberg-ish 3-panel terminal on `#1a1a24`:
  - Top: fake search bar ("Search assets, news, research...", readOnly) + 🔔 button.
  - Left (28%): tabs **Market sectors | Stocks**. Sectors = 9 hardcoded mock rows (SIXB Materials … SIXU Utilities) with value, ±% and a thin proportional bar; Stocks = live quotes for the watchlist in the same row style.
  - Center: **Latest updates** (red live dot, "Show more →", 4 mock headlines with age+source) and **US market summary** — 4 accordion cards (first expanded by default; only the first has body text) with a "Dive deeper on this topic with AI" button (non-functional).
  - Right (32%): mock market commentary + "Market Performance" bullets; **live chart** with ticker buttons `SPY, IXIC, DJI, NVDA` (IXIC→QQQ and DJI→DIA are remapped for the API), violet `#a78bfa` line, range buttons `1D(5-min res), 5D(15-min), 1M/YTD(~180d)/MAX(365d) daily`, "Full Chart" stub. Empty/error states: "Set API key in Settings for live data" / "Loading chart…" / "No chart data. Check symbol or API key." / "Failed to load chart."
- **StocksPage** default layout: dashboard 12×5 on top; then one 3×2 StockWidget per watchlist symbol, 4 per row (3/row md, 2/row sm).
- Default watchlist `AAPL, GOOGL, MSFT`. Symbols added via `prompt()`, uppercased, deduped.
- ⚠️ **Security note**: the repo ships a real-looking Finnhub API key as the store default — treat it as compromised, rotate it, and default to an empty string in any rebuild. Also note Finnhub's free tier now returns 403 for `/stock/candle`, so charts may show the empty state with a free key.

## 12. Dexcom CGM

- Settings: enable toggle, **Use mock data** toggle, API base (sandbox/US/EU/JP), Client ID, Client secret (password field), Redirect URI, "Open Dexcom authorization URL" link (appears once ID+URI set; builds `/v3/oauth2/login?client_id&redirect_uri&response_type=code&scope=offline_access&state=gloss` against the real origin), Access token (paste; token exchange is deliberately **not** done in-browser), show-on-dashboard toggle, scale slider. Setup doc `resources/DEXCOM_SETUP.md`.
- Client fetches (Bearer token) `/v3/users/self/`: `dataRange`, `egvs`, `devices`, `alerts`, `calibrations`, `events` — the last five over the trailing **7 days**, ISO timestamps with milliseconds stripped. Non-JSON responses raise a descriptive proxy/base-URL error. EGVs/dataRange failures are fatal; the other four fail soft to null.
- **Widget UI**: "Mock" amber badge when mock; states for disabled / no-token / loading / error. Error copy is user-friendly and specific: CORS explanation suggesting mock mode or a backend for `Failed to fetch`; re-auth walkthrough for 401.
- Main display: rounded inner panel (scales via `dexcomScale`); decorative "+" button; **big glucose circle** (latest EGV; `>400` for 401, `<40` for 39, em-dash for null) with unit and a **trend arrow** mapped from Dexcom trend strings (doubleUp/singleUp ▲, fortyFiveUp ↗, flat →, fortyFiveDown ↘, singleDown/doubleDown ▼, notComputable/rateOutOfRange/none —); time-range tabs **"3 Hours" | 6 | 12 | 24** (+ decorative ⋯); recharts LineChart with **target band 70–180** (`ReferenceArea`), **dashed yellow line at 250**, Y domain 40–400 with ticks [40,70,180,250,400], dashed white-ish reading line with 2 px dots, X ticks = hour numbers with the final point labeled **"Now"**, sentinel values 39/401 excluded from the chart; empty state "No readings in selected range".
- **Mock data**: 5 EGVs over the last 2 h (98→102→115→108→112 mg/dL with varied trends, G7 metadata), one device, one urgentLowSoon alert, one calibration, carbs 45 g + insulin 5 u events, 7-day data range.

## 13. Health

- **HealthPage**: quick-entry row (Steps, Sleep hours step 0.5, Weight kg step 0.1 + amber Add button; date = today; empty fields omitted) above a grid with default layout Health 4×3 + Dexcom 4×3.
- **HealthWidget**: today's metric (Steps / Sleep h / Weight kg lines) or "No data for today…"; footer "Recent: <last 5 dates, newest first>".

## 14. News

`NewsFeedWidget`: static placeholder list — "Welcome to your Smart Mirror" / "Add widgets from the + bar" / "Clock, weather, and news here". (Registered and renderable, but not listed in the palette labels map, so its palette chip shows the raw id.)

## 15. Settings page (two-pane, every control)

Header row: "Settings" + **search box that filters sidebar entries by label**. Left sidebar (w-56): collapsible **General** group (▼/▶) with Appearance, Background, Glassmorphism, Smart Mirror, Dashboard; then flat items Calendar & Events, World clocks, Clock widget, Weather, Stocks, Dexcom, Azan. Active item = amber tint + amber left border. Right pane is an inset-shadowed scroll area (`max-w-[50%]`) showing only the active section, each a `glass-panel` card.

- **Appearance**: Theme select (Dark / Light / Circadian (light day, dark night) / Gamified); Font scale slider 0.5–5 ×0.1 with live "(x.x×, up to 5×)"; Orientation select any/portrait/landscape (persisted but **not enforced anywhere** — dead setting).
- **Background**: Type select color/image; color → color picker + hex text input; image → URL input + fallback color picker.
- **Glassmorphism**: Panel translucency slider 0.2–0.9 ×0.05 (%, live); Backdrop blur select Off/Subtle 4/Medium 8/Strong 12; Content blur slider 0–24 px.
- **Smart Mirror**: enable checkbox (explains webcam background + glass widgets); camera dropdown (enumerateDevices videoinput; "Default camera" option; hint to grant permission when list is empty; disabled until enabled).
- **Dashboard**: Show add/remove palette bar toggle (default on); Auto-arrange toggle + an "Arrange now" style behavior on add; note that ×-remove works from the grid.
- **Calendar & Events**: show-on-dashboard toggle; widget scale 0.5–5; US holidays toggle; Islamic holidays toggle; Hijri display toggle.
- **World clocks**: enable toggle; clock style Digital/Analog; bar scale 0.5–5; current zones as removable chips (× ); when <5, a **debounced (~300 ms) city search** box (Open-Meteo geocoding, ≥2 chars, up to ~12 results, "Searching…" indicator, dropdown listbox with "City, Country", disabled "(already added)" rows, "No matches. Try another name."); selecting adds the zone **and** stores `{name, lat, lon}` so the label/weather use the exact city (e.g., Islamabad instead of Karachi for Asia/Karachi). There's also a plain zone `<select>` of ~22 common zones.
- **Clock widget**: Display Analog/Digital; when analog: Dial style select (1 Classic … 5 High contrast) + Show hour numbers checkbox.
- **Weather**: Location name text; Latitude/Longitude number inputs; Units select Fahrenheit/Celsius.
- **Stocks**: Finnhub API key (password input, "free at finnhub.io"); watchlist chips with × and "+ Add" via prompt; show-on-dashboard toggle; scale slider.
- **Dexcom**: everything in §12 plus explanatory copy and developer-portal link.
- **Azan**: enable prayer times; play-at-prayer-time; prayer bar scale; lat/lon; calculation method select (12 methods); helper text about placing mp3 files; volume slider 0–1 ×0.05 (%); **per-prayer sound rows** (Fajr…Isha: select Azan 1–5 + emerald Play + Stop); "Today's prayer times" info card.

## 16. Persistence & PWA

- zustand persist keys: **`gloss-settings`**, **`gloss-layouts`**; plus manual keys in §10.1. Everything is device-local; no backend.
- `manifest.json`: name "Gloss Smart Dashboard", short_name "Gloss", standalone, any orientation, bg `#0f172a`, theme `#1e293b`, single SVG icon (vite.svg).
- `sw.js`: cache name `gloss-v1`; `skipWaiting` + `clients.claim`; **network-first with cache fallback** on fetch (though nothing is ever written to the cache — offline fallback is effectively inert; a rebuild should actually populate the cache).

## 17. Known quirks / bugs / dead code (fix in the rebuild)

1. **Hardcoded Finnhub API key** shipped as the settings default — security issue; must be removed/rotated.
2. Dexcom **client secret stored in localStorage** (documented as a convenience; keep the paste-token flow but warn clearly).
3. **AQI widget can never show data** — `aqi` is never fetched (Open-Meteo has a separate air-quality API that should be wired up).
4. **Pressure unit bug** — hPa displayed as "in"; **Visibility unit bug** — meters treated as miles; **dewPoint** always 0.
5. `orientationLock` setting and `useOrientation` hook are unused (no enforcement).
6. `lightweight-charts` dependency unused.
7. Mini-map, news feed, Finnhub sectors/news/summary, dashboard search bar, "Dive deeper with AI", "Full Chart", Dexcom "+" button are placeholders/mock.
8. `prompt()`/native dialogs used for add-event, add-stock, add-task fallback — should become proper modals.
9. CalendarWidget doesn't refresh when events change elsewhere (reads localStorage once).
10. Finnhub free tier 403s on `/stock/candle` → charts often empty with a free key.
11. Service worker never caches anything (see §16).
12. Dexcom time-range tab labels are inconsistent ("3 Hours", "6", "12", "24").
13. `UTC` world clock maps to London weather; `zoneLabel` hardcodes Esbjerg/Islamabad personal labels.
