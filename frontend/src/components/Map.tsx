import { Box, Image, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

type CameraData = {
  name: string;
  county: string;
  latitude: number;
  longitude: number;
  route: string;
  direction: string;
  current_image_url: string;
  streaming_video_url: string;
  in_service: boolean;
};

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
              <Image
                src={camera.current_image_url}
                alt={camera.name}
                w={300}
                mt="xs"
              />
            </Box>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
