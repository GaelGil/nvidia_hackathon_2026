import { Box, Image, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

type CameraData = {
  name: string;
  county: string;
  latitude: number;
  longitude: number;
  route: string;
  direction: string;
  current_image_url: string;
  current_video_url: string;
  in_service: boolean;
};

function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const video = videoRef.current;
    
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
      script.onload = () => {
        const hls = new (window as unknown as { Hls: new () => { loadSource: (s: string) => void; attachMedia: (m: HTMLMediaElement) => void; on: (e: string, c: () => void) => void } }).Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on("hlsManifestParsed", () => {
          video.play().catch(() => {});
        });
      };
      document.head.appendChild(script);
    }
  }, [videoUrl]);

  return (
    <video
      ref={videoRef}
      controls
      style={{ width: "100%", maxWidth: 320, marginTop: 8 }}
    />
  );
}

export default function LeafletMap() {
  const [cameras, setCameras] = useState<CameraData[]>([]);

  useEffect(() => {
    fetch("/sf_cameras.json")
      .then((res) => res.json())
      .then((data) => setCameras(data))
      .catch((err) => console.error("Failed to load cameras:", err));
  }, []);

  // https://sfcam.live/
  // https://ops.alertcalifornia.org/
  // https://www.extranomical.com/live-web-cams/
  // https://www.sanfranciscopolice.org/publicsafetycameras
  // https://www.parksconservancy.org/parks/park-web-cams

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

      {cameras.map((camera, index) => (
        <CircleMarker
          key={index}
          center={[camera.latitude, camera.longitude]}
          radius={6}
          pathOptions={{
            color: "#000",
            fillColor: camera.in_service ? "#00ff00" : "#ff0000",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <Box>
              <Text fw={500}>{camera.name}</Text>
              <Text>Route: {camera.route}</Text>
              <Text>Direction: {camera.direction}</Text>
              <Text>County: {camera.county}</Text>
              <Text>
                Status: {camera.in_service ? "In Service" : "Out of Service"}
              </Text>
              {camera.current_image_url && (
                <Image
                  src={camera.current_image_url}
                  alt={camera.name}
                  w={300}
                  mt="xs"
                />
              )}
              {camera.current_video_url && (
                <VideoPlayer videoUrl={camera.current_video_url} />
              )}
            </Box>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
