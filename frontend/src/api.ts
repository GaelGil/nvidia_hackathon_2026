/**
 * NemoGuardian API client
 * Typed wrappers around the FastAPI backend at VITE_BACKEND_URL.
 */

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Shared types (mirrors Pydantic models in sentinel/server.py)
// ---------------------------------------------------------------------------

export interface Camera {
  id: string;
  name: string;
  district: number;
  lat: number;
  lon: number;
  county: string;
  route: string;
  direction: string;
  image_url: string;
  stream_url: string;
}

export interface IncidentReport {
  incident_id: string;
  timestamp: string;
  camera_id: string;
  camera_name: string;
  location: {
    lat: number;
    lon: number;
    route: string;
    direction: string;
    county: string;
  };
  is_incident: boolean;
  severity: number; // 0–10
  incident_type: string;
  vehicles_involved: number;
  lanes_affected: string[];
  injuries_likely: boolean;
  description: string;
  recommended_response: string[];
  confidence: number;
}

export interface HealthStatus {
  status: string;
  agent_ready: boolean;
  cameras_loaded: number;
  incidents_logged: number;
  monitoring_active: boolean;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[API ${res.status}] ${path}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** GET /health */
export async function getHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>("/health");
}

/** GET /cameras?district=&limit= */
export async function getCameras(
  district?: number,
  limit = 100
): Promise<Camera[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (district !== undefined) params.set("district", String(district));
  const data = await apiFetch<{ cameras: Camera[]; total: number }>(
    `/cameras?${params}`
  );
  return data.cameras;
}

/** GET /incidents?severity_min=&limit= */
export async function getIncidents(
  severityMin = 0,
  limit = 50
): Promise<IncidentReport[]> {
  const params = new URLSearchParams({
    severity_min: String(severityMin),
    limit: String(limit),
  });
  const data = await apiFetch<{ incidents: IncidentReport[]; total: number }>(
    `/incidents?${params}`
  );
  return data.incidents;
}

/** POST /analyze-camera/{camera_id} — trigger on-demand scan */
export async function analyzeCamera(cameraId: string): Promise<IncidentReport> {
  return apiFetch<IncidentReport>(`/analyze-camera/${encodeURIComponent(cameraId)}`, {
    method: "POST",
  });
}

/** POST /monitor/start */
export async function startMonitoring(
  districts: number[] = [4],
  maxCameras = 10,
  pollIntervalSec = 30
): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/monitor/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      districts,
      max_cameras: maxCameras,
      poll_interval_sec: pollIntervalSec,
    }),
  });
}

/** POST /monitor/stop */
export async function stopMonitoring(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/monitor/stop", { method: "POST" });
}

// ---------------------------------------------------------------------------
// Utility: map numeric severity (0-10) to display tier
// ---------------------------------------------------------------------------

export function severityLabel(s: number): "low" | "medium" | "high" {
  if (s >= 7) return "high";
  if (s >= 4) return "medium";
  return "low";
}

export function severityColor(s: number): string {
  if (s >= 7) return "#ff4444";
  if (s >= 4) return "#ffaa00";
  return "#00cc66";
}
