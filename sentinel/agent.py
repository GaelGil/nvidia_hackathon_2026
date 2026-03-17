"""
SENTINEL Agent — Nemotron-powered incident detection pipeline.

Pipeline: Frame → Nemotron VL (scene description) → Nemotron Super 49B (structured reasoning)
Uses NVIDIA NIM hosted API at integrate.api.nvidia.com (OpenAI-compatible).
"""
import os
import json
import time
import datetime
from typing import Optional
from openai import OpenAI
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Structured output model
# ---------------------------------------------------------------------------

class IncidentReport(BaseModel):
    incident_id: str = Field(description="e.g. INC-20260316-001")
    timestamp: str
    camera_id: str
    camera_name: str
    location: dict = Field(description="{lat, lon, route, direction, county}")
    is_incident: bool = Field(description="True if an actual incident is detected")
    severity: int = Field(ge=0, le=10, description="0=no incident, 1-3=minor, 4-6=moderate, 7-9=severe, 10=catastrophic")
    incident_type: str = Field(description="collision|multi_vehicle|rollover|fire|debris|stalled|hazmat|flooding|none")
    vehicles_involved: int = Field(ge=0)
    lanes_affected: list[str] = Field(default_factory=list)
    injuries_likely: bool = False
    description: str = Field(description="2-3 sentence human-readable summary")
    recommended_response: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)


# ---------------------------------------------------------------------------
# Agent class
# ---------------------------------------------------------------------------

class SentinelAgent:
    """Two-step Nemotron pipeline for traffic incident analysis."""

    # Models
    VL_MODEL = "nvidia/nemotron-nano-12b-v2-vl"  # vision-language
    REASONING_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5"  # reasoning + tool calling

    SYSTEM_PROMPT = """You are SENTINEL, an AI highway safety analyst for California DOT.
You receive scene descriptions from CCTV cameras and must produce a structured incident assessment.

RULES:
- If the scene looks NORMAL (flowing traffic, no anomalies), set is_incident=false, severity=0.
- Err on the side of caution — a minor anomaly is better than a missed accident.
- severity scale: 0=normal, 1-3=minor (stall/debris), 4-6=moderate (fender bender), 7-9=severe (multi-vehicle/injuries), 10=catastrophic (fire/hazmat/full closure).
- recommended_response options: dispatch_chp, dispatch_ambulance, dispatch_fire, dispatch_tow, dispatch_hazmat, activate_CMS_signs, request_traffic_break, close_lanes, close_highway, notify_caltrans_tmc, monitor_only.
- confidence: how sure are you that your assessment is correct (0.0 to 1.0).

Respond ONLY with valid JSON matching the IncidentReport schema. No markdown, no backticks."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("NVIDIA_API_KEY", "")
        if not self.api_key:
            raise ValueError("Set NVIDIA_API_KEY environment variable")
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=self.api_key,
        )
        self._counter = 0

    # ------------------------------------------------------------------
    # Step 1: Vision — describe the scene
    # ------------------------------------------------------------------
    def describe_scene(self, image_b64: str) -> str:
        """Send a frame to Nemotron VL and get a scene description."""
        try:
            resp = self.client.chat.completions.create(
                model=self.VL_MODEL,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are analyzing a California highway CCTV camera image. "
                                "Describe exactly what you see: number of vehicles, their positions, "
                                "any visible damage or collisions, stopped vehicles in travel lanes, "
                                "smoke or fire, debris on road, lane blockages, traffic flow status, "
                                "weather/visibility conditions. Be factual and specific."
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"},
                        },
                    ],
                }],
                max_tokens=512,
                temperature=0.2,
            )
            return resp.choices[0].message.content
        except Exception as e:
            return f"[VL ERROR] Could not analyze image: {e}"

    # ------------------------------------------------------------------
    # Step 2: Reasoning — structured incident report
    # ------------------------------------------------------------------
    def assess_incident(self, scene_description: str, camera: dict) -> IncidentReport:
        """Send scene description to Nemotron Super 49B for structured assessment."""
        self._counter += 1
        now = datetime.datetime.now(datetime.timezone.utc)
        incident_id = f"INC-{now.strftime('%Y%m%d')}-{self._counter:04d}"

        user_prompt = f"""Camera: {camera.get('id', 'UNKNOWN')}
Name: {camera.get('name', 'Unknown')}
Route: {camera.get('route', '')} {camera.get('direction', '')}
County: {camera.get('county', '')}
Coordinates: ({camera.get('lat', 0)}, {camera.get('lon', 0)})

SCENE DESCRIPTION FROM VISUAL ANALYSIS:
{scene_description}

Produce the IncidentReport JSON. Use incident_id="{incident_id}", timestamp="{now.isoformat()}", camera_id="{camera.get('id', '')}", camera_name="{camera.get('name', '')}"."""

        try:
            resp = self.client.chat.completions.create(
                model=self.REASONING_MODEL,
                messages=[
                    {"role": "system", "content": "/no_think\n" + self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=1024,
                temperature=0.1,
            )
            raw = resp.choices[0].message.content.strip()
            # Clean potential markdown fences
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()

            data = json.loads(raw)
            # Override IDs to ensure consistency
            data["incident_id"] = incident_id
            data["timestamp"] = now.isoformat()
            data["camera_id"] = camera.get("id", "")
            data["camera_name"] = camera.get("name", "")
            data["location"] = {
                "lat": camera.get("lat", 0),
                "lon": camera.get("lon", 0),
                "route": camera.get("route", ""),
                "direction": camera.get("direction", ""),
                "county": camera.get("county", ""),
            }
            return IncidentReport(**data)

        except json.JSONDecodeError as e:
            # Fallback: return a safe default
            return IncidentReport(
                incident_id=incident_id,
                timestamp=now.isoformat(),
                camera_id=camera.get("id", ""),
                camera_name=camera.get("name", ""),
                location={
                    "lat": camera.get("lat", 0),
                    "lon": camera.get("lon", 0),
                    "route": camera.get("route", ""),
                    "direction": camera.get("direction", ""),
                    "county": camera.get("county", ""),
                },
                is_incident=False,
                severity=0,
                incident_type="none",
                vehicles_involved=0,
                description=f"Analysis parse error: {e}. Raw scene: {scene_description[:200]}",
                confidence=0.0,
                recommended_response=["monitor_only"],
            )
        except Exception as e:
            return IncidentReport(
                incident_id=incident_id,
                timestamp=now.isoformat(),
                camera_id=camera.get("id", ""),
                camera_name=camera.get("name", ""),
                location={
                    "lat": camera.get("lat", 0),
                    "lon": camera.get("lon", 0),
                    "route": camera.get("route", ""),
                    "direction": camera.get("direction", ""),
                    "county": camera.get("county", ""),
                },
                is_incident=False,
                severity=0,
                incident_type="none",
                vehicles_involved=0,
                description=f"Agent error: {e}",
                confidence=0.0,
                recommended_response=["monitor_only"],
            )

    # ------------------------------------------------------------------
    # Full pipeline
    # ------------------------------------------------------------------
    def analyze(self, image_b64: str, camera: dict) -> IncidentReport:
        """Full pipeline: VL scene description → structured incident report."""
        t0 = time.time()
        print(f"[sentinel] Analyzing {camera.get('name', 'unknown')}...")

        # Step 1: Vision
        scene = self.describe_scene(image_b64)
        t1 = time.time()
        print(f"[sentinel] VL done in {t1-t0:.1f}s — {scene[:120]}...")

        # Step 2: Reasoning
        report = self.assess_incident(scene, camera)
        t2 = time.time()
        print(f"[sentinel] Reasoning done in {t2-t1:.1f}s — severity={report.severity}, type={report.incident_type}")

        return report


# ---------------------------------------------------------------------------
# Quick test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    from caltrans import get_cameras, fetch_frame

    agent = SentinelAgent()
    cameras = get_cameras([7])
    if cameras:
        cam = cameras[0]
        raw, b64 = fetch_frame(cam)
        if b64:
            report = agent.analyze(b64, cam)
            print("\n" + json.dumps(report.model_dump(), indent=2))
        else:
            print("Could not fetch frame")
    else:
        print("No cameras found")
