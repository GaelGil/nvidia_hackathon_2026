import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Box, Button, Card, Container, Flex, Grid, Group, Stack, Text, Title, Badge } from "@mantine/core";
import { FiArrowLeft, FiPhone, FiAlertTriangle, FiMapPin, FiClock, FiTruck } from "react-icons/fi";
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
	route?: string;
	direction?: string;
	county?: string;
	vehiclesInvolved?: number;
	lanesAffected?: string[];
	recommendedResponse?: string[];
}

const logs: LogItem[] = [
	{
		id: "1",
		severity: "high",
		desc: "Multi-Vehicle Collision — I-80 Bay Bridge",
		timestamp: "2026-03-16 17:30:00",
		options: [
			{ id: "dispatch_ambulance", desc: "Dispatch ambulance" },
			{ id: "dispatch_chp", desc: "Dispatch CHP" },
			{ id: "dispatch_tow", desc: "Dispatch tow truck" },
			{ id: "activate_CMS_signs", desc: "Activate CMS signs" },
		],
		cameraId: "D4-I-80-AT JCT RTE 580/880",
		detailedDesc:
			"Nemotron VL detected a three-vehicle pile-up in Lane 2 and Lane 3 of I-80 westbound on the Bay Bridge approach. Lead SUV shows deployed airbags. Second vehicle (sedan) rear-ended the SUV at significant speed, third vehicle (pickup) jack-knifed attempting to avoid collision. Debris field spans ~50 meters. Emergency flashers visible on all three vehicles. Traffic behind the scene is at a complete standstill stretching approximately 2.5 miles east toward the toll plaza. No visible fire, but fluid leaks observed on pavement. Fog is reducing visibility to ~200 meters.",
		route: "I-80",
		direction: "Westbound",
		county: "Alameda / San Francisco",
		vehiclesInvolved: 3,
		lanesAffected: ["Lane 2", "Lane 3", "Shoulder"],
		recommendedResponse: ["dispatch_ambulance", "dispatch_chp", "dispatch_tow", "activate_CMS_signs", "request_traffic_break"],
	},
	{
		id: "2",
		severity: "high",
		desc: "Pedestrian Incident — Golden Gate Bridge",
		timestamp: "2026-03-16 17:25:00",
		options: [
			{ id: "dispatch_ambulance", desc: "Dispatch ambulance" },
			{ id: "dispatch_chp", desc: "Dispatch CHP" },
			{ id: "close_lanes", desc: "Close lanes" },
		],
		cameraId: "D4-GOLDEN GATE BRIDGE-North Tower",
		detailedDesc:
			"Nemotron VL flagged an anomaly near the north tower — a pedestrian has been struck by a vehicle in the right-most travel lane. The victim appears conscious but lying on the road surface. A silver sedan is stopped 20 feet ahead with the driver exiting the vehicle. Bridge patrol has partially blocked the lane. Traffic is merging left, causing a bottleneck extending into Marin County. Light rain is present.",
		route: "US-101",
		direction: "Southbound",
		county: "Marin / San Francisco",
		vehiclesInvolved: 1,
		lanesAffected: ["Lane 3 (right)"],
		recommendedResponse: ["dispatch_ambulance", "dispatch_chp", "close_lanes", "notify_caltrans_tmc"],
	},
	{
		id: "3",
		severity: "medium",
		desc: "Stalled Vehicle Blocking Lane — US-101 SB",
		timestamp: "2026-03-16 17:20:00",
		options: [
			{ id: "dispatch_tow", desc: "Dispatch tow truck" },
			{ id: "activate_CMS_signs", desc: "Activate CMS signs" },
		],
		cameraId: "D4-US-101-SB AT CESAR CHAVEZ",
		detailedDesc:
			"White box truck stalled in Lane 2 of US-101 southbound near Cesar Chavez exit. Driver has exited and is standing on the shoulder with hazard lights flashing. Moderate traffic congestion developing behind the blockage — vehicles merging into Lane 1 and Lane 3. No collision damage visible; appears to be a mechanical failure. Estimated clearance time: 20 minutes with tow assistance.",
		route: "US-101",
		direction: "Southbound",
		county: "San Francisco",
		vehiclesInvolved: 1,
		lanesAffected: ["Lane 2"],
		recommendedResponse: ["dispatch_tow", "activate_CMS_signs", "monitor_only"],
	},
	{
		id: "4",
		severity: "medium",
		desc: "Debris on Roadway — I-280 NB Daly City",
		timestamp: "2026-03-16 17:15:00",
		options: [
			{ id: "dispatch_tow", desc: "Dispatch maintenance crew" },
			{ id: "activate_CMS_signs", desc: "Activate CMS signs" },
		],
		cameraId: "D4-I-280-NB AT DALY CITY",
		detailedDesc:
			"Large wooden pallets and scattered cardboard scattered across Lane 1 and Lane 2 of I-280 northbound near Daly City. Appears to have fallen from a commercial vehicle that has already left the scene. Multiple vehicles swerving to avoid debris. Minor fender-bender in Lane 1 where a sedan clipped a guardrail while avoiding a pallet. No injuries, but road surface hazard is ongoing.",
		route: "I-280",
		direction: "Northbound",
		county: "San Mateo",
		vehiclesInvolved: 0,
		lanesAffected: ["Lane 1", "Lane 2"],
		recommendedResponse: ["dispatch_tow", "activate_CMS_signs"],
	},
	{
		id: "5",
		severity: "low",
		desc: "Normal Traffic Flow — I-101 NB",
		timestamp: "2026-03-16 17:10:00",
		options: [{ id: "monitor_only", desc: "Continue monitoring" }],
		cameraId: "D4-US-101-NB AT HOSPITAL CURVE",
		detailedDesc:
			"All lanes flowing smoothly on US-101 northbound at Hospital Curve. Average speed ~55 mph. No obstructions, no anomalies detected by Nemotron VL. Visibility is good, dry pavement. This segment has been incident-free for the past 4 hours.",
		route: "US-101",
		direction: "Northbound",
		county: "San Francisco",
		vehiclesInvolved: 0,
		lanesAffected: [],
		recommendedResponse: ["monitor_only"],
	},
	{
		id: "6",
		severity: "low",
		desc: "Dense Fog Advisory — Golden Gate Bridge",
		timestamp: "2026-03-16 17:05:00",
		options: [
			{ id: "activate_CMS_signs", desc: "Activate fog advisory signs" },
			{ id: "monitor_only", desc: "Continue monitoring" },
		],
		cameraId: "D4-GOLDEN GATE BRIDGE-South Tower",
		detailedDesc:
			"Nemotron VL scene analysis shows visibility reduced to approximately 150 meters on the Golden Gate Bridge southbound lanes. Dense advection fog rolling in from the Pacific. Traffic is moving cautiously at reduced speeds (~30 mph). No incidents detected, but conditions are ripe for chain-reaction collisions. Recommend activating fog advisory CMS signs and increasing monitoring frequency.",
		route: "US-101",
		direction: "Southbound",
		county: "San Francisco",
		vehiclesInvolved: 0,
		lanesAffected: [],
		recommendedResponse: ["activate_CMS_signs", "monitor_only"],
	},
	{
		id: "7",
		severity: "low",
		desc: "Construction Zone — I-80 EB",
		timestamp: "2026-03-16 17:00:00",
		options: [{ id: "monitor_only", desc: "Continue monitoring" }],
		cameraId: "D4-I-80-EB AT POWELL ST",
		detailedDesc:
			"Active construction zone on I-80 eastbound near Powell Street. Lane shift in effect — Lanes 1 and 2 merged into a single lane. Workers present with high-visibility vests. Temporary K-rail barriers installed. Traffic slowed to 25 mph through the zone. No incidents. Expected completion in 2 hours.",
		route: "I-80",
		direction: "Eastbound",
		county: "San Francisco",
		vehiclesInvolved: 0,
		lanesAffected: ["Lane 1", "Lane 2 (merged)"],
		recommendedResponse: ["monitor_only"],
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

						{/* Incident Summary Card */}
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

								<Flex gap="lg" wrap="wrap">
									<Flex align="center" gap={6}>
										<FiClock size={14} color="#999" />
										<Text c="dimmed" fz="sm">{log.timestamp}</Text>
									</Flex>
									{log.route && (
										<Flex align="center" gap={6}>
											<FiMapPin size={14} color="#999" />
											<Text c="dimmed" fz="sm">{log.route} {log.direction}</Text>
										</Flex>
									)}
									{log.county && (
										<Text c="dimmed" fz="sm">📍 {log.county}</Text>
									)}
									{log.vehiclesInvolved !== undefined && log.vehiclesInvolved > 0 && (
										<Flex align="center" gap={6}>
											<FiTruck size={14} color="#999" />
											<Text c="dimmed" fz="sm">{log.vehiclesInvolved} vehicle{log.vehiclesInvolved > 1 ? "s" : ""}</Text>
										</Flex>
									)}
								</Flex>

								<Text c="white" size="lg" lh={1.6}>
									{log.detailedDesc}
								</Text>

								{/* Lanes affected */}
								{log.lanesAffected && log.lanesAffected.length > 0 && (
									<Box>
										<Text c="yellow" fz="sm" fw={600} mb={4}>
											Lanes Affected:
										</Text>
										<Group gap={6}>
											{log.lanesAffected.map((lane, i) => (
												<Badge key={i} color="yellow" variant="outline" size="sm">
													{lane}
												</Badge>
											))}
										</Group>
									</Box>
								)}

								{/* Recommended response */}
								{log.recommendedResponse && log.recommendedResponse.length > 0 && (
									<Box>
										<Text c="orange" fz="sm" fw={600} mb={4}>
											<FiAlertTriangle size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
											Recommended Response:
										</Text>
										<Stack gap={4}>
											{log.recommendedResponse.map((action, i) => (
												<Text key={i} c="dimmed" fz="sm">
													→ {action.replace(/_/g, " ")}
												</Text>
											))}
										</Stack>
									</Box>
								)}

								{log.cameraId && (
									<Text c="dimmed" fz="sm">
										📷 <strong>Camera:</strong> {log.cameraId}
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
