# SENTINEL — Project Status Tracker
**Updated:** 2026-03-16 | **Phase:** Frontend Integration Complete

## ✅ DONE
- [x] Caltrans CCTV ingester — pulls live JPEG frames from 449+ cameras, zero auth
- [x] Nemotron agent pipeline — VL scene description → Super 49B structured reasoning
- [x] FastAPI server with CORS — `/cameras`, `/analyze`, `/analyze-camera/{id}`, `/incidents`, `/monitor/start`, `/monitor/stop`, `/health`
- [x] Structured IncidentReport JSON schema (Pydantic)
- [x] Background monitoring loop (auto-polls cameras)
- [x] Test script verified — frames pulling from Caltrans successfully

### Frontend integration (2026-03-16)
- [x] `src/api.ts` — typed API client for all backend endpoints
- [x] `Map.tsx` — cameras loaded from `GET /cameras?district=4` (live Caltrans feed via backend)
- [x] `Map.tsx` — "Scan with Nemotron" button per camera popup → `POST /analyze-camera/{id}`
- [x] `Map.tsx` — inline result card: severity, incident type, recommended actions, confidence
- [x] `HomeSideBar.tsx` — polls `GET /incidents` every 10 s, shows live IncidentReport cards
- [x] `HomeSideBar.tsx` — severity badges (red/orange/green), real recommended actions
- [x] `HomeSideBar.tsx` — monitoring toggle button (start/stop background loop)
- [x] `HomeSideBar.tsx` — agent status indicator (online/offline)
- [x] `const.ts` — updated PROJECT_NAME to "SENTINEL", NVIDIA favicon

## 🔧 STILL NEEDED (before demo)
- [ ] **NVIDIA_API_KEY** — set env var and validate VL + Super 49B calls end-to-end
- [ ] **Deploy backend** — `uvicorn server:app --host 0.0.0.0 --port 8000` on Railway/Render/brev
- [ ] **Set VITE_BACKEND_URL** — `.env` in `frontend/` pointing to deployed backend

## 📋 DEMO PREP
- [ ] Pick 5-10 interesting cameras, run `POST /monitor/start`
- [ ] Show sidebar filling up with incident cards in real-time
- [ ] Pick a specific camera popup → click "Scan with Nemotron" live on stage
- [ ] Polish: severity color coding already done (green/yellow/red)

## 🏗️ Architecture
```
Caltrans CWWP2 JSON API (free, no auth)
    → 449+ live CCTV cameras in LA / Bay Area
    → JPEG snapshots refreshed every 1–20 min

FastAPI Backend (sentinel/)
    → GET  /cameras         — camera list with live image URLs
    → POST /analyze-camera/{id}  — on-demand single camera scan
    → GET  /incidents       — recent IncidentReport log
    → POST /monitor/start   — background polling loop
    → Step 1: Nemotron Nano 12B VL (vision) → scene description
    → Step 2: Nemotron Super 49B (reasoning) → structured IncidentReport
    → ReAct pattern: Observe → Reason → Recommend

React Frontend (frontend/)
    → Leaflet dark map — camera dots, click for popup + Scan button
    → Sidebar — live incident feed, severity badges, recommended actions
    → Monitoring toggle — start/stop background loop from the UI

NVIDIA Tech Stack:
    ✓ Nemotron Nano 12B VL  (nvidia/nemotron-nano-12b-v2-vl)
    ✓ Nemotron Super 49B    (nvidia/llama-3.3-nemotron-super-49b-v1.5)
    ✓ NIM Microservices (hosted inference — no GPU needed)
    ✓ ReAct agentic reasoning pattern
    ✓ Structured output / function calling
```
