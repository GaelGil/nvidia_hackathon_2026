import { Box, Image, Badge, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type PlayerState =
  | { status: "loading" }
  | { status: "playing" }
  | { status: "error"; fallbackImage: string };

interface VideoPlayerProps {
  streamUrl: string;
  imageUrl: string;
  alt: string;
}

export default function VideoPlayer({ streamUrl, imageUrl, alt }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>({ status: "loading" });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setState({ status: "loading" });

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          setState({ status: "error", fallbackImage: imageUrl });
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          hls.destroy();
          setState({ status: "error", fallbackImage: imageUrl });
        }
      });

      video.onplay = () => setState({ status: "playing" });
      video.onerror = () => setState({ status: "error", fallbackImage: imageUrl });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {
          setState({ status: "error", fallbackImage: imageUrl });
        });
      });
      video.onplay = () => setState({ status: "playing" });
      video.onerror = () => setState({ status: "error", fallbackImage: imageUrl });
    } else {
      setState({ status: "error", fallbackImage: imageUrl });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamUrl, imageUrl]);

  const isStatic = state.status === "error";

  return (
    <Box pos="relative" mt="xs">
      {isStatic ? (
        <Box>
          <Badge
            size="sm"
            color="gray"
            variant="filled"
            style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
          >
            📷 Static Image
          </Badge>
          <Image
            src={state.status === "error" ? state.fallbackImage : imageUrl}
            alt={alt}
            w={280}
            radius="sm"
          />
        </Box>
      ) : (
        <Box>
          <Badge
            size="sm"
            color="red"
            variant="filled"
            style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
          >
            🔴 LIVE
          </Badge>
          <video
            ref={videoRef}
            muted
            playsInline
            style={{
              width: 280,
              borderRadius: 6,
              background: "#000",
            }}
          />
        </Box>
      )}

      {state.status === "loading" && (
        <Text fz="xs" c="dimmed" mt={4}>
          Loading stream...
        </Text>
      )}

      {isStatic && (
        <Text fz="xs" c="dimmed" mt={4}>
          Stream unavailable — showing static image
        </Text>
      )}
    </Box>
  );
}
