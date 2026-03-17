"use client";

import {
	ActionIcon,
	Anchor,
	Badge,
	Box,
	Button,
	Card,
	Flex,
	Group,
	Image,
	ScrollArea,
	Stack,
	Text,
} from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FiArrowRight, FiColumns, FiPhone, FiEye } from "react-icons/fi";
import { LOGO, PROJECT_NAME } from "@/const";

type LogSeverity = "high" | "medium" | "low";

interface LogItem {
	id: string;
	severity: LogSeverity;
	desc: string;
	timestamp: string;
	options: LogOption[];
	cameraId?: string;
	detailedDesc?: string;
}

interface LogOption {
	id: string;
	desc: string;
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

interface HomeSideBarProps {
	collapsed: boolean;
	toggle: () => void;
}

const HomeSideBar: React.FC<HomeSideBarProps> = ({ collapsed, toggle }) => {
	const [hovered, setHovered] = useState(false);
	const navigate = useNavigate();

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

	const handleCall911 = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		window.open("tel:911", "_blank");
	};

	const listItems = logs.map((log: LogItem) => (
		<ScrollArea>
			<Card
				key={log.id}
				shadow="sm"
				padding="lg"
				radius="md"
				withBorder
				style={{ cursor: "pointer" }}
				onClick={() => navigate({ to: "/log/$logId", params: { logId: log.id } })}
			>
				<Group justify="space-between" mt="md" mb="xs">
					<Text fw={500}>{log.desc}</Text>
					<Badge color={getSeverityColor(log.severity)}>{log.severity.toUpperCase()}</Badge>
				</Group>

				<Text size="sm" c="dimmed" mb="sm">
					{log.timestamp}
				</Text>

				<Group justify="space-between">
					{log.severity === "high" && (
						<Button
							leftSection={<FiPhone size={16} />}
							color="red"
							variant="filled"
							size="xs"
							onClick={handleCall911}
						>
							Call 911
						</Button>
					)}
					<Button
						leftSection={<FiEye size={16} />}
						variant="light"
						size="xs"
						style={{ marginLeft: "auto" }}
					>
						View Details
					</Button>
				</Group>
			</Card>
		</ScrollArea>
	));

	return (
		<Stack>
			{/* Controls */}
			<Flex
				align="center"
				justify={collapsed ? "center" : "space-between"}
				px={collapsed ? "xs" : "md"}
			>
				{collapsed ? (
					<Box
						onMouseEnter={() => setHovered(true)}
						onMouseLeave={() => setHovered(false)}
						onClick={() => {
							toggle();
							setHovered(false);
						}}
						style={{ cursor: "pointer", position: "relative" }}
					>
						{hovered ? (
							<ActionIcon variant="subtle" h={32} w={32}>
								<FiArrowRight size={18} color="white" />
							</ActionIcon>
						) : (
							<Image src={LOGO} alt={`${PROJECT_NAME} Logo`} h={25} w={25} />
						)}
					</Box>
				) : (
					<>
						<Flex align="center" gap="xs">
							<Anchor underline="never" component={Link} to="/">
								<Image src={LOGO} alt={`${PROJECT_NAME} Logo`} h={32} w={32} />
							</Anchor>
						</Flex>
						<ActionIcon onClick={toggle} variant="subtle" size="sm">
							<FiColumns size={18} color="white" />
						</ActionIcon>
					</>
				)}
			</Flex>
			{}
			{!collapsed && (
				<>
					{/*<ScrollArea>*/}
					<Stack p="sm">{listItems}</Stack>
					{/*</ScrollArea>*/}
				</>
			)}
		</Stack>
	);
};

export default HomeSideBar;
