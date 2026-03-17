# SENTINEL — Live Highway Incident Detection

AI-powered accident detection system using California DOT live CCTV feeds + NVIDIA Nemotron.

## Architecture (Simplified)
```
Caltrans CCTV (449+ LA cameras)
       │ JPEG snapshots
       ▼
  FastAPI Server (/analyze)
       │
       ▼
  Nemotron VL 12B ──→ Scene Description
       │
       ▼
  Nemotron Super 49B ──→ Structured IncidentReport JSON
       │
       ▼
  Vercel Dashboard (your frontend)
```

## Quick Start (< 2 min)

```bash
# 1. Install
pip install openai fastapi uvicorn requests pydantic python-dotenv

# 2. Set API key (from build.nvidia.com → Profile → API Keys)
export NVIDIA_API_KEY=nvapi-YOUR_KEY_HERE

# 3. Test
python test_pipeline.py

# 4. Run server
uvicorn server:app --host 0.0.0.0 --port 8000
```

## API Endpoints (for Vercel frontend)

### `GET /health`
Check system status.

### `GET /cameras?district=7&limit=50`
List available Caltrans CCTV cameras with GPS, route info, image URLs.

### `POST /analyze` ⭐ Core endpoint
Analyze a frame. Send either `image_base64` or `image_url`.

**Request:**
```json
{
  "image_base64": "...",
  "camera_id": "D7-I405-1",
  "camera_name": "I-405 SB at Wilshire",
  "lat": 34.06, "lon": -118.44,
  "route": "I-405", "direction": "South",
  "county": "Los Angeles"
}
```

**Response (IncidentReport):**
```json
{
  "incident_id": "INC-20260316-0001",
  "timestamp": "2026-03-16T10:30:00Z",
  "camera_id": "D7-I405-1",
  "camera_name": "I-405 SB at Wilshire",
  "location": {"lat": 34.06, "lon": -118.44, "route": "I-405", "direction": "South", "county": "Los Angeles"},
  "is_incident": true,
  "severity": 7,
  "incident_type": "multi_vehicle",
  "vehicles_involved": 3,
  "lanes_affected": ["lane_2", "lane_3"],
  "injuries_likely": true,
  "description": "Three-vehicle collision blocking lanes 2 and 3. Airbags deployed on lead vehicle.",
  "recommended_response": ["dispatch_ambulance", "dispatch_chp", "dispatch_tow", "activate_CMS_signs"],
  "confidence": 0.85
}
```

### `POST /analyze-camera/{camera_id}`
Auto-fetches latest frame from Caltrans and analyzes it.

### `GET /incidents?severity_min=4&limit=50`
Get logged incidents, filtered by severity.

### `POST /monitor/start`
Start background monitoring loop:
```json
{"districts": [7], "max_cameras": 10, "poll_interval_sec": 30}
```

### `POST /monitor/stop`
Stop the monitoring loop.

## NVIDIA Tech Stack (for submission)
- **Nemotron Nano 12B VL** — vision-language scene analysis
- **Nemotron Super 49B** — structured reasoning + incident classification
- **NVIDIA NIM** — inference microservices (hosted API)
- **ReAct pattern** — observe scene → reason about severity → recommend action

## Files
- `caltrans.py` — Caltrans CCTV feed ingester
- `agent.py` — Nemotron VL + Super 49B pipeline
- `server.py` — FastAPI server
- `test_pipeline.py` — Smoke test
