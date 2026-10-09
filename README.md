# KrishiNetra – AI-Powered Smart Agriculture Platform (Frontend)

**Smart Farming Starts with Early Detection.**
Team **Proxy Pirates** · Smart India Hackathon 2026 · Problem Statement **SIH26131**

React + Vite + Tailwind frontend for early detection of crop disease and pest infestation from leaf photographs.
The Flask backend and AI/ML model are developed separately – this project only talks to them over HTTP.

---

## 1. Run locally (Windows)

1. Install **Node.js 18 or newer** (LTS) from https://nodejs.org – tick "Add to PATH".
2. Open **Command Prompt** or **PowerShell** and go to the project folder:
   ```bat
   cd path\to\krishinetra
   ```
3. Create your environment file:
   ```bat
   copy .env.example .env
   ```
4. Install and start:
   ```bat
   npm install
   npm run dev
   ```
5. Open the address shown (normally http://localhost:5173).

To test on a phone on the same Wi-Fi, use the "Network" address Vite prints (the dev server already listens on all interfaces). Camera capture on phones usually requires HTTPS or `localhost`.

Production build: `npm run build` then `npm run preview`.

---

## 2. Connect to the Flask backend

Set the backend address in `.env`:

```
VITE_API_BASE_URL=http://localhost:5000
```

Restart `npm run dev` after changing `.env`.

### Required endpoint

`POST /api/predict` – `multipart/form-data`, image field name **`file`** (change `API_CONFIG.uploadFieldName` in `src/config.js`).
If a crop is selected the field `crop` is also sent.

Expected JSON (the frontend is defensive – only some fields are required):

```json
{
  "disease": "Label returned by the model",
  "confidence": 0.93,
  "status": "healthy | disease | uncertain | unsupported",
  "severity": "low | moderate | high",
  "crop": "optional",
  "affected_regions": [{ "x": 0.1, "y": 0.2, "width": 0.3, "height": 0.2 }],
  "overlay_url": "optional URL of a mask/overlay image",
  "guidance": {
    "immediate": ["..."], "preventive": ["..."], "monitoring": ["..."], "expert": ["..."]
  },
  "prediction_id": "optional"
}
```

* `confidence` may be 0–1, 0–100 or `"93%"`.
* `severity`, `affected_regions`/`overlay_url` and `guidance` are shown **only** when supplied. Otherwise the UI says "Severity assessment not available" and does not draw regions.
* Region values ≤ 1 are treated as normalised fractions; larger values as pixels of the original image.
* The response may also be wrapped as `{ "prediction": {...} }`, `{ "result": {...} }` or `{ "data": {...} }`.

### CORS

Enable CORS in Flask for the Vite dev origin:

```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:5173"])
```

### Optional endpoints (confirm with backend developers – nothing assumes they exist)

| Route | Used by | If missing |
|---|---|---|
| `GET /api/history` | Scan History, Dashboard | Falls back to scans saved on this device |
| `GET /api/guidance/:disease` | Results, Guidance | Shows a "guidance not available" placeholder |
| `GET /api/monitoring` | Monitoring ("Check for monitoring data") | Cards stay "Planned Integration – no live data" |

All route names, field names, timeouts and response normalisation are in **`src/config.js`** and **`src/services/api.js`**.

---

## 3. Honest-by-design behaviour

* **Live mode never shows fake predictions.** If the backend is down, times out or returns something unusable, the farmer sees an error – the app never silently switches to demo data.
* **Demo Mode** (Settings) is an explicit, clearly labelled toggle for jury presentations. It shows illustrative samples with a yellow "Demo" banner/tags and uses a separate demo history. Demo data is never mixed with real history.
* Dashboard numbers and charts come only from real saved scans; charts appear after at least 3 scans (`MIN_CHART_POINTS`).
* Environmental Monitoring is labelled **Planned Integration / Coming Soon**; no weather, sensor values or risk predictions are shown.
* No performance statistics, accuracy claims, pesticide dosages or fictional team members are included.

### Where scans are stored

Each successful result (plus a small photo thumbnail) is saved in the browser's `localStorage` on that device (max 60 scans, can be turned off in Settings). This is a convenience until a backend history API exists.

---

## 4. Customise

| What | Where |
|---|---|
| Backend URL, routes, upload field name | `.env`, `src/config.js` |
| Supported crops dropdown (empty until confirmed) | `SUPPORTED_CROPS` in `src/config.js` |
| Team member names and roles | `TEAM.members` in `src/config.js` |
| Real hero photograph | put a file in `public/images/` and set `VITE_HERO_IMAGE_URL=/images/hero.jpg` |
| Marketing copy | `src/data/content.js` |
| Colours | `tailwind.config.js` |
| Hindi / Telugu | fill `src/i18n/hi.js` and `te.js` with **verified** translations (same keys as `en.js`), then set `available: true` in `src/i18n/index.jsx` |

Hero imagery is an original SVG illustration so there are no broken image links; swap in real field photographs for the final presentation.

---

## 5. Project structure

```
src/
  components/  layout · navigation · cards · charts · upload · diagnosis
  pages/       Home · Diagnosis · Results · Dashboard · History · Guidance · Monitoring · About · Settings
  services/    api.js (all backend calls + normalisation) · demo.js (Demo Mode only)
  context/     AppContext (demo mode, saved scans)
  hooks/       useScans · useGuidance
  i18n/        en / hi / te dictionaries
  data/        navigation · marketing content
  utils/       image validation · formatting · status styling
```

Routes: `/` · `/diagnosis` · `/results/:id` · `/dashboard` · `/history` · `/guidance` · `/monitoring` · `/settings` · `/about`

## 6. Accessibility

Skip-to-content link, keyboard-operable controls with visible focus, ARIA labels on uploads/meters/charts, large touch targets (≥ 48px), high-contrast palette, and `prefers-reduced-motion` respected (Framer Motion `reducedMotion="user"` + CSS).

## 7. Disclaimer

KrishiNetra provides AI-assisted predictions, not confirmed diagnoses. Predictions and field performance require validation by agricultural experts.
