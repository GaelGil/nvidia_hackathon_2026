"""
SENTINEL FastAPI Server
Endpoints for the Vercel dashboard to consume.

Run: uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""
import os
import json
import time
import base64
import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import SentinelAgent, IncidentReport
from caltrans import get_cameras, fetch_frame

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="NemoGuardian API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel frontend
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
agent: Optional[SentinelAgent] = None
camera_cache: list[dict] = []
incident_log: list[dict] = []  # Most recent incidents
monitoring_active = False

# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    global agent, camera_cache
    api_key = os.getenv("NVIDIA_API_KEY", "")
    if api_key:
        agent = SentinelAgent(api_key)
        print("[server] Agent initialized")
    else:
        print("[server] WARNING: No NVIDIA_API_KEY — agent not initialized")

    # Pre-load cameras
    camera_cache.extend(get_cameras([7, 4, 12]))
    print(f"[server] Loaded {len(camera_cache)} cameras")


# ---------------------------------------------------------------------------
# Request/Response models
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    image_base64: Optional[str] = None  # Either provide base64...
    image_url: Optional[str] = None     # ...or a direct image URL
    camera_id: Optional[str] = None
    camera_name: Optional[str] = ""
    lat: Optional[float] = 0.0
    lon: Optional[float] = 0.0
    route: Optional[str] = ""
    direction: Optional[str] = ""
    county: Optional[str] = ""


class MonitorConfig(BaseModel):
    districts: list[int] = [7]
    max_cameras: int = 10
    poll_interval_sec: int = 30


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "agent_ready": agent is not None,
        "cameras_loaded": len(camera_cache),
        "incidents_logged": len(incident_log),
        "monitoring_active": monitoring_active,
    }


@app.get("/cameras")
async def list_cameras(district: Optional[int] = None, limit: int = 50):
    """List available Caltrans cameras."""
    cams = camera_cache
    if district:
        cams = [c for c in cams if c["district"] == district]
    return {"cameras": cams[:limit], "total": len(cams)}


@app.post("/analyze", response_model=IncidentReport)
async def analyze_frame(req: AnalyzeRequest):
    """Analyze a single frame — the core endpoint your frontend calls."""
    if not agent:
        raise HTTPException(503, "Agent not initialized — set NVIDIA_API_KEY")

    # Get image as base64
    b64 = req.image_base64
    if not b64 and req.image_url:
        import requests as r
        try:
            resp = r.get(req.image_url, timeout=15)
            b64 = base64.b64encode(resp.content).decode()
        except Exception as e:
            raise HTTPException(400, f"Could not fetch image: {e}")

    if not b64:
        raise HTTPException(400, "Provide image_base64 or image_url")

    camera_meta = {
        "id": req.camera_id or "MANUAL",
        "name": req.camera_name or "Manual Upload",
        "lat": req.lat,
        "lon": req.lon,
        "route": req.route,
        "direction": req.direction,
        "county": req.county,
    }

    report = agent.analyze(b64, camera_meta)

    # Log it
    incident_log.append(report.model_dump())
    if len(incident_log) > 200:
        incident_log.pop(0)

    return report


@app.post("/analyze-camera/{camera_id}")
async def analyze_camera_by_id(camera_id: str):
    """Fetch latest frame from a Caltrans camera and analyze it."""
    if not agent:
        raise HTTPException(503, "Agent not initialized")

    cam = next((c for c in camera_cache if c["id"] == camera_id), None)
    if not cam:
        raise HTTPException(404, f"Camera {camera_id} not found")

    raw, b64 = fetch_frame(cam)
    if not b64:
        raise HTTPException(502, f"Could not fetch frame from {camera_id}")

    report = agent.analyze(b64, cam)
    incident_log.append(report.model_dump())
    if len(incident_log) > 200:
        incident_log.pop(0)
    return report


@app.get("/incidents")
async def get_incidents(severity_min: int = 0, limit: int = 50):
    """Get recent incident reports, optionally filtered by minimum severity."""
    filtered = [i for i in reversed(incident_log) if i["severity"] >= severity_min]
    return {"incidents": filtered[:limit], "total": len(filtered)}


@app.post("/monitor/start")
async def start_monitoring(config: MonitorConfig, background_tasks: BackgroundTasks):
    """Start background monitoring loop."""
    global monitoring_active
    if monitoring_active:
        return {"status": "already_running"}
    monitoring_active = True
    background_tasks.add_task(monitor_loop, config)
    return {"status": "started", "config": config.model_dump()}


@app.post("/monitor/stop")
async def stop_monitoring():
    global monitoring_active
    monitoring_active = False
    return {"status": "stopped"}


async def monitor_loop(config: MonitorConfig):
    """Background task that polls cameras and runs analysis."""
    global monitoring_active
    cams = [c for c in camera_cache if c["district"] in config.districts][:config.max_cameras]
    print(f"[monitor] Watching {len(cams)} cameras, polling every {config.poll_interval_sec}s")

    while monitoring_active:
        for cam in cams:
            if not monitoring_active:
                break
            try:
                raw, b64 = fetch_frame(cam)
                if not b64:
                    continue
                report = agent.analyze(b64, cam)
                incident_log.append(report.model_dump())
                if len(incident_log) > 200:
                    incident_log.pop(0)
                if report.is_incident and report.severity >= 4:
                    print(f"[monitor] 🚨 INCIDENT: {report.camera_name} — {report.incident_type} (sev {report.severity})")
            except Exception as e:
                print(f"[monitor] Error on {cam['id']}: {e}")
            await asyncio.sleep(1)  # Small delay between cameras
        await asyncio.sleep(config.poll_interval_sec)

    print("[monitor] Stopped")


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
