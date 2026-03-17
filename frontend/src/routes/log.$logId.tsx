import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Box, Button, Card, Container, Flex, Grid, Group, Stack, Text, Title, Badge } from "@mantine/core";
import { FiArrowLeft, FiPhone } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import HomeSideBar from "../components/Common/Home/HomeSideBar";
import { useDisclosure } from "@mantine/hooks";

type LogSeverity = "high" | "medium" | "low";

interface LogOption {
	id: string;
	desc: string;
}

interface LogItem {
	id: string;
	severity: LogSeverity;
	desc: string;
	timestamp: string;
	options: LogOption[];
	cameraId?: string;
	detailedDesc?: string;
}

const logs: LogItem[] = [
	{
		id: "1",
		severity: "high",
		desc: "Traffic Incident - Multi-vehicle collision",
		timestamp: "2026-03-16 10:30:00",
		options: [{ id: "1", desc: "option1" } as LogOption],
		cameraId: "SF-I80-001",
		detailedDesc: "Multi-vehicle collision reported at Bay Bridge. Multiple cars involved. Emergency services dispatched. Traffic backed up for 2 miles. Lane closures in effect.",
	},
	{
		id: "2",
		severity: "high",
		desc: "Pedestrian Incident - Possible injury",
		timestamp: "2026-03-16 10:25:00",
		options: [
			{ id: "1", desc: "option1" } as LogOption,
			{ id: "2", desc: "option1" } as LogOption,
		],
		cameraId: "SF-GoldenGate-002",
		detailedDesc: "Pedestrian struck by vehicle near Golden Gate Bridge. Victim is conscious but injured. Ambulance en route. Scene is being secured by traffic control.",
	},
	{
		id: "3",
		severity: "medium",
		desc: "Traffic Congestion - Heavy traffic",
		timestamp: "2026-03-16 10:20:00",
		options: [
			{ id: "1", desc: "option1" } as LogOption,
			{ id: "1", desc: "option1" } as LogOption,
			{ id: "1", desc: "option1" } as LogOption,
			{ id: "1", desc: "option1" } as LogOption,
		],
		cameraId: "SF-101-003",
		detailedDesc: "Heavy traffic congestion due to rush hour. Vehicles moving slowly. No incidents detected. Expected to clear in 30 minutes.",
	},
	{
		id: "4",
		severity: "medium",
		desc: "Vehicle Breakdown - Stall reported",
		timestamp: "2026-03-16 10:15:00",
		options: [
			{ id: "1", desc: "option1" } as LogOption,
			{ id: "1", desc: "option1" } as LogOption,
			{ id: "1", desc: "option1" } as LogOption,
		],
		cameraId: "SF-280-004",
		detailedDesc: "Vehicle stalled on right lane. Driver is safe and awaiting assistance. Roadside assistance has been notified. Minor traffic delay.",
	},
	{
		id: "5",
		severity: "low",
		desc: "Normal Traffic Flow",
		timestamp: "2026-03-16 10:10:00",
		options: [
			{ id: "1", desc: "option1" } as LogOption,
			{ id: "1", desc: "option1" } as LogOption,
		],
		cameraId: "SF-101-005",
		detailedDesc: "Traffic conditions are normal. All lanes are flowing smoothly. No incidents reported in this area.",
	},
	{
		id: "6",
		severity: "low",
		desc: "Weather Advisory - Foggy conditions",
		timestamp: "2026-03-16 10:05:00",
		options: [
			{ id: "1", desc: "option1" } as LogOption,
			{ id: "1", desc: "option1" } as LogOption,
		],
		cameraId: "SF-GoldenGate-001",
		detailedDesc: "Dense fog advisory in effect. Reduced visibility for drivers. Speed reduction recommended. Please use caution.",
	},
	{
		id: "7",
		severity: "low",
		desc: "Construction Zone - Lane shift",
		timestamp: "2026-03-16 10:05:00",
		options: [{ id: "1", desc: "option1" } as LogOption],
		cameraId: "SF-80-006",
		detailedDesc: "Construction zone active. Lane shift in effect. Workers present. Slow down to 25 mph. Expected completion in 2 hours.",
	},
];

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
			return;
		}

		// @ts-expect-error - hls.js is loaded from CDN
		if (window.Hls && window.Hls.isSupported()) {
			// @ts-expect-error - hls.js is loaded from CDN
			const hls = new window.Hls();
			hls.loadSource(videoUrl);
			hls.attachMedia(video);
			return;
		}

		const script = document.createElement("script");
		script.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
		script.onload = () => {
			// @ts-expect-error - hls.js is loaded from CDN
			if (window.Hls && window.Hls.isSupported()) {
				// @ts-expect-error - hls.js is loaded from CDN
				const hls = new window.Hls();
				hls.loadSource(videoUrl);
				hls.attachMedia(video);
			}
		};
		document.head.appendChild(script);
	}, [videoUrl]);

	return (
		<video
			ref={videoRef}
			controls
			autoPlay
			loop
			muted
			style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
		/>
	);
}

export const Route = createFileRoute("/log/$logId")({
	component: LogDetailPage,
});

function LogDetailPage() {
	const { logId } = Route.useParams();
	const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
	const log = logs.find((l) => l.id === logId);
	const [cameras, setCameras] = useState<CameraData[]>([]);

	useEffect(() => {
		fetch("/sf_cameras.json")
			.then((res) => res.json())
			.then((data) => setCameras(data))
			.catch((err) => console.error("Failed to load cameras:", err));
	}, []);

	const camera = cameras.find((c) => c.name === log?.cameraId);

	const getSeverityColor = (severity: LogSeverity) => {
		switch (severity) {
			case "high":
				return "red";
			case "medium":
				return "orange";
			case "low":
				return "green";
		}
	};

	const handleCall911 = () => {
		window.open("tel:911", "_blank");
	};

	if (!log) {
		return (
			<AppShell layout="alt" header={{ height: 60 }} navbar={{ width: 60, breakpoint: "sm" }} padding="md" bg={"black"}>
				<AppShell.Navbar p="md" withBorder={false} bg={"black"}>
					<HomeSideBar collapsed={true} toggle={toggleCollapsed} />
				</AppShell.Navbar>
				<AppShell.Main>
					<Container size="xl">
						<Text c="white">Log not found</Text>
					</Container>
				</AppShell.Main>
			</AppShell>
		);
	}

	return (
		<AppShell layout="alt" header={{ height: 60 }} navbar={{ width: collapsed ? 60 : 400, breakpoint: "sm" }} padding="md" bg={"black"}>
			<AppShell.Navbar p="md" withBorder={false} bg={"black"}>
				<HomeSideBar collapsed={collapsed} toggle={toggleCollapsed} />
			</AppShell.Navbar>
			<AppShell.Main>
				<Container size="xl">
					<Stack gap="xl">
						<Flex align="center" justify="space-between">
							<Group>
								<Link to="/">
									<Button leftSection={<FiArrowLeft size={18} />} variant="subtle" c="white">
										Back to Map
									</Button>
								</Link>
							</Group>
							{log.severity === "high" && (
								<Button leftSection={<FiPhone size={18} />} color="red" size="lg" onClick={handleCall911}>
									Call 911
								</Button>
							)}
						</Flex>

						<Card padding="xl" radius="md" withBorder bg="#1a1a1a">
							<Stack gap="md">
								<Group justify="space-between">
									<Title order={2} c="white">
										{log.desc}
									</Title>
									<Badge size="xl" color={getSeverityColor(log.severity)}>
										{log.severity.toUpperCase()}
									</Badge>
								</Group>
								<Text c="dimmed">{log.timestamp}</Text>
								<Text c="white" size="lg">
									{log.detailedDesc}
								</Text>
								{log.cameraId && (
									<Text c="dimmed">
										<strong>Camera ID:</strong> {log.cameraId}
									</Text>
								)}
							</Stack>
						</Card>

						<Title order={3} c="white">
							Live Camera Feed
						</Title>

						<Card padding="lg" radius="md" withBorder bg="#1a1a1a">
							{camera ? (
								<Grid>
									<Grid.Col span={12}>
										<Box style={{ height: 400, backgroundColor: "#000", borderRadius: 8, overflow: "hidden" }}>
											{camera.current_video_url ? (
												<VideoPlayer videoUrl={camera.current_video_url} />
											) : camera.current_image_url ? (
												<img
													src={camera.current_image_url}
													alt={camera.name}
													style={{ width: "100%", height: "100%", objectFit: "cover" }}
												/>
											) : (
												<Flex align="center" justify="center" h={400}>
													<Text c="dimmed">No feed available</Text>
												</Flex>
											)}
										</Box>
									</Grid.Col>
									<Grid.Col span={12}>
										<Stack gap="xs">
											<Text c="white" fw={500} size="lg">
												{camera.name}
											</Text>
											<Text c="dimmed">Route: {camera.route}</Text>
											<Text c="dimmed">Direction: {camera.direction}</Text>
											<Text c="dimmed">County: {camera.county}</Text>
											<Text c={camera.in_service ? "green" : "red"}>
												Status: {camera.in_service ? "In Service" : "Out of Service"}
											</Text>
										</Stack>
									</Grid.Col>
								</Grid>
							) : (
								<Flex align="center" justify="center" h={400}>
									<Text c="dimmed">Camera not found for ID: {log.cameraId}</Text>
								</Flex>
							)}
						</Card>
					</Stack>
				</Container>
			</AppShell.Main>
		</AppShell>
	);
}
