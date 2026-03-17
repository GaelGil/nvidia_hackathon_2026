import { Box, Button, Image, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import {
  type Camera,
  type IncidentReport,
  analyzeCamera,
  getCameras,
  severityColor,
} from "@/api";

// Per-camera scan state
type ScanState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; report: IncidentReport }
  | { status: "error"; message: string };

function ScanButton({ cam }: { cam: Camera }) {
  const [scan, setScan] = useState<ScanState>({ status: "idle" });

  async function handleScan() {
    setScan({ status: "loading" });
    try {
      const report = await analyzeCamera(cam.id);
      setScan({ status: "done", report });
    } catch (e: unknown) {
      setScan({
        status: "error",
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return (
    <Box mt="xs">
      {scan.status === "idle" && (
        <Button size="xs" variant="filled" color="green" onClick={handleScan}>
          Scan with Nemotron
        </Button>
      )}

      {scan.status === "loading" && (
        <Box style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Loader size="xs" color="green" />
          <Text fz="xs" c="dimmed">
            Analyzing…
          </Text>
        </Box>
      )}

      {scan.status === "error" && (
        <Box>
          <Text fz="xs" c="red">
            Error: {scan.message}
          </Text>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            mt={4}
            onClick={handleScan}
          >
            Retry
          </Button>
        </Box>
      )}

      {scan.status === "done" && (
        <Box
          p="xs"
          style={{
            borderRadius: 6,
            border: `1px solid ${severityColor(scan.report.severity)}`,
            background: "#111",
          }}
        >
          <Text
            fz="xs"
            fw={700}
            style={{ color: severityColor(scan.report.severity) }}
          >
            {scan.report.is_incident
              ? `⚠ ${scan.report.incident_type.replace(/_/g, " ").toUpperCase()} — Sev ${scan.report.severity}/10`
              : "✓ No Incident"}
          </Text>
          <Text fz="xs" c="dimmed" mt={2}>
            {scan.report.description}
          </Text>
          {scan.report.recommended_response.length > 0 && (
            <Text fz="xs" c="yellow" mt={4}>
              → {scan.report.recommended_response.join(", ")}
            </Text>
          )}
          <Text fz="xs" c="dimmed" mt={2}>
            Confidence: {Math.round(scan.report.confidence * 100)}%
          </Text>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            mt={4}
            onClick={handleScan}
          >
            Re-scan
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default function LeafletMap() {
  const [cameras, setCameras] = useState<Camera[]>([]);

  useEffect(() => {
    getCameras(4) // District 4 = Bay Area
      .then((cams) => setCameras(cams))
      .catch((err) => console.error("Failed to load cameras from backend:", err));
  }, []);

  return (
    <MapContainer
      center={[37.76062130454376, -122.42187034608556]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        attribution="© OpenStreetMap, © CARTO"
        subdomains="abcd"
      />

      {cameras.map((cam) => (
        <CircleMarker
          key={cam.id}
          center={[cam.lat, cam.lon]}
          radius={6}
          pathOptions={{
            color: "#000",
            fillColor: "#00ff00",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <Box style={{ minWidth: 220 }}>
              <Text fw={600} fz="sm">
                {cam.name}
              </Text>
              <Text fz="xs" c="dimmed">
                Route {cam.route} {cam.direction}
              </Text>
              <Text fz="xs" c="dimmed">
                {cam.county} — District {cam.district}
              </Text>
              {cam.image_url && (
                <Image
                  src={cam.image_url}
                  alt={cam.name}
                  w={280}
                  mt="xs"
                  radius="sm"
                />
              )}
              <ScanButton cam={cam} />
            </Box>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
