<div align="center">

# 🌦️ Weather Prediction

**A real-time weather intelligence dashboard — current conditions, hourly and multi-day
forecasts, air quality, UV, severe-weather alerts and temperature trends for any city on earth.**

[![CI](https://github.com/Mithran-MV/weather-prediction/actions/workflows/ci.yml/badge.svg)](https://github.com/Mithran-MV/weather-prediction/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## What it does

Type any city and get a full picture of its weather in one screen — no tabs, no scrolling
through ads, no unit guessing.

| | |
|---|---|
| **🔍 Search anywhere** | Debounced typeahead over a worldwide gazetteer, fully keyboard-navigable (`↑` `↓` `Enter` `Esc`). |
| **📍 One-tap geolocation** | Uses the browser location API to jump straight to where you are. |
| **⭐ Saved places** | Star cities to pin them to a quick-switch bar; persists across sessions and syncs between tabs. |
| **🌡️ Live conditions** | Temperature, feels-like, humidity, wind speed *and bearing*, pressure, visibility — with a hero gradient that changes with the actual sky. |
| **🕐 24-hour outlook** | Rolls across midnight instead of stopping at it, with rain probability. |
| **📅 Multi-day forecast** | High/low range bars on a shared scale, so days are comparable at a glance. |
| **🍃 Air quality** | US EPA index translated into plain-language health advice, plus PM2.5 / PM10 / O₃ / NO₂ scaled against WHO guideline values. |
| **☀️ Sun & UV** | Sun-position arc between sunrise and sunset, WHO UV band with exposure advice, moon phase. |
| **📈 Trend chart** | Observed history and forecast on **one continuous axis**, so you can see whether the week ahead breaks the trend. |
| **⚠️ Severe alerts** | Live government advisories with expandable full text. |
| **🗺️ Location map** | Leaflet + OpenStreetMap, re-centres as you search. |
| **🌗 Themes & units** | Light / dark / system, and °C ↔ °F everywhere at once. |
| **♿ Accessible** | ARIA combobox, radio groups, skip link, visible focus rings, `prefers-reduced-motion` honoured. |

---

## Architecture

```
Browser  ──►  /api/weather   ──►  WeatherAPI.com
              /api/search         (key lives here, server-side only)
   │              │
   │              ├── Zod-validated responses
   │              ├── fixed-window rate limiting
   │              └── Next data cache (10 min forecast, 24 h history/search)
   │
   └── React 19 client: units, saved places, theme, visibility-aware refresh
```

**The key never reaches the browser.** Every upstream call happens inside a route handler in
`src/app/api/`, reading a non-`NEXT_PUBLIC_` environment variable. You can confirm it:

```bash
npm run build && grep -r "$WEATHER_API_KEY" .next/static
```

That search returns nothing.

### Project layout

```
src/
├── app/
│   ├── api/weather/route.ts   # forecast + history + AQI + alerts, one call
│   ├── api/search/route.ts    # typeahead gazetteer lookup
│   ├── layout.tsx             # metadata, fonts, theme provider, skip link
│   ├── page.tsx               # server shell
│   └── globals.css            # Tailwind v4 tokens + condition gradients
├── components/
│   ├── ui/                    # Card, Skeleton, ThemeToggle
│   └── weather/               # dashboard and its panels
├── hooks/                     # useWeather, useLocalStorage, useGeolocation, useHydrated
└── lib/
    ├── weather-api.ts         # server-only upstream client
    ├── schemas.ts             # Zod contracts for every field the UI reads
    ├── rate-limit.ts          # fixed-window limiter
    ├── aqi.ts · sky.ts        # EPA/UV bands, condition→gradient mapping
    └── units.ts · utils.ts    # metric/imperial, formatting
```

---

## Getting started

**Prerequisites:** Node.js 20.9 or newer.

```bash
git clone https://github.com/Mithran-MV/weather-prediction.git
cd weather-prediction
npm install
cp .env.example .env.local
```

Add a free key from [weatherapi.com](https://www.weatherapi.com/signup.aspx) to `.env.local`:

```dotenv
WEATHER_API_KEY=your_key_here
```

```bash
npm run dev
```

Open <http://localhost:3000>.

> **Free-tier note.** WeatherAPI's free plan returns 3 forecast days and 7 days of history.
> The UI adapts to whatever the plan returns — the forecast card labels itself
> "3-day forecast" or "7-day forecast" accordingly.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config, `next/core-web-vitals` + TypeScript) |
| `npm run typecheck` | `tsc --noEmit`, strict mode with `noUncheckedIndexedAccess` |
| `npm test` | Vitest unit suite |
| `npm run test:coverage` | Coverage report for `lib/` and `hooks/` |
| `npm run format` | Prettier, with Tailwind class sorting |

---

## API reference

Both endpoints are rate-limited per IP and safe to call from your own front end.

### `GET /api/weather`

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `q` | string | *required* | City name, `City,Country`, or `lat,lon` |
| `days` | 1–14 | `7` | Forecast days (capped by your plan) |
| `history` | 0–7 | `5` | Days of observed history to include |

```bash
curl "http://localhost:3000/api/weather?q=13.08,80.28&days=3&history=5"
```

Returns `{ location, current, forecast[], history[], alerts[], fetchedAt }`.
Rate limit: 60 requests/minute. Cached for 10 minutes at the edge.

### `GET /api/search`

| Parameter | Type | Notes |
|---|---|---|
| `q` | string | Queries shorter than 3 characters return `[]` without an upstream call |

```bash
curl "http://localhost:3000/api/search?q=chennai"
```

Rate limit: 120 requests/minute. Cached for 24 hours.

**Errors** are uniform: `{ "error": "..." }` with an appropriate status. Validation failures
add `issues` keyed by field. Upstream authentication failures are deliberately reported as a
generic 500 so a probing client learns nothing about the key.

---

## Deploying

Works on any Node host; Vercel is one click.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mithran-MV/weather-prediction)

Set these environment variables in your host's dashboard:

| Variable | Required | Purpose |
|---|:---:|---|
| `WEATHER_API_KEY` | ✅ | Server-side WeatherAPI key |
| `WEATHER_API_BASE_URL` | — | Override the API base URL |
| `NEXT_PUBLIC_DEFAULT_LOCATION` | — | Location shown before the visitor picks one |
| `NEXT_PUBLIC_SITE_URL` | — | Absolute URL, used for OpenGraph and the sitemap |

The in-memory rate limiter is per-instance and resets on redeploy — appropriate for a
single-region deployment. For multi-region, swap the `Map` in `src/lib/rate-limit.ts` for a
shared store such as Upstash Redis.

---

## Testing

```bash
npm test
```

37 unit tests cover unit conversion and compass bearings, EPA/UV banding, condition→gradient
mapping, query-schema validation, relative-time formatting, and the rate limiter's window
rollover and per-key isolation.

---

## Security

- The WeatherAPI key is server-side only and verified absent from the client bundle.
- `.env` files are gitignored; `.env.example` documents the shape without secrets.
- Every upstream response is parsed through Zod before it reaches a component.
- Both public endpoints are rate-limited, with bounded memory for the limiter's key map.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`) are set in `next.config.mjs`.

Found something? Open an issue — please don't include a working key in the report.

---

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). CI runs lint,
typecheck, tests and a production build on every push.

## License

[MIT](LICENSE) © Mithran MV

## Acknowledgements

Weather data by [WeatherAPI.com](https://www.weatherapi.com/) · Map tiles by
[OpenStreetMap](https://www.openstreetmap.org/copyright) contributors · Icons by
[Lucide](https://lucide.dev)
