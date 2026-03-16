import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useState } from "react";
import { Box, Text } from "@mantine/core";

// fix default icon (Leaflet default icons need config)

type MarkerPoint = {
  id: string;
  lat: number;
  lng: number;
  city: string;
  type_: string;
  url: string;
  live: boolean;
};

export default function LeafletMap() {
  const [markers, setMarkers] = useState<MarkerPoint[]>([
    {
      id: "1",
      lat: 37.7612,
      lng: -122.4349,
      city: "San Francisco",
      type_: "A",
      url: "/-_VOJgsVJ0E?si=bHXtsqUsDNZaorXI&amp;controls=0",
      live: true,
    },
    {
      id: "2",
      lat: 37.803,
      lng: -122.40123,
      city: "San Francisco",
      type_: "B",
      url: "0aF8elLpiMo",
      live: false,
    },
    {
      id: "3",
      lat: 37.7874,
      lng: -122.3885,
      city: "San Francisco",
      type_: "C",
      url: "CXYr04BWvmc",
      live: true,
    },
    {
      id: "4",
      lat: 37.8057,
      lng: -122.451755,
      city: "San Francisco",
      type_: "D",
      url: "https://www.parksconservancy.org/parks/park-web-cams",
      live: false,
    },
  ]);

  // https://sfcam.live/
  // https://ops.alertcalifornia.org/
  // https://www.extranomical.com/live-web-cams/
  // https://www.sanfranciscopolice.org/publicsafetycameras
  // https://www.parksconservancy.org/parks/park-web-cams

  return (
    <MapContainer
      center={[37.76062130454376, -122.42187034608556]}
      zoom={13}
      // bounds={bounds}
      // maxBounds={bounds}
      // maxBoundsViscosity={1.0}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        attribution="© OpenStreetMap, © CARTO"
        subdomains="abcd"
      />

      {markers.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={6}
          pathOptions={{
            color: "#000",
            fillColor: "#ff0000",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <Box>
              <Text>City: {p.city}</Text>
              <Text>Type: {p.type_}</Text>
              <Text>Live: {p.live ? "yes" : "no"}</Text>
              <iframe
                // width="560"
                // height="315"
                src={`https://www.youtube.com/embed/${p.url}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </Box>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
