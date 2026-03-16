"use client";

import {
  Box,
  Group,
  Text,
  Stack,
  Flex,
  Image,
  ActionIcon,
  Badge,
  Button,
  Collapse,
  ScrollArea,
  Anchor,
} from "@mantine/core";
import { useState } from "react";
import {
  FiColumns,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { LOGO, PROJECT_NAME } from "@/const";
import { Link } from "@tanstack/react-router";
import { time } from "console";

type LogSeverity = "high" | "medium" | "low";

interface LogItem {
  id: string;
  severity: LogSeverity;
  desc: string;
  timestamp: string;
  options: string[];
}

const logs: LogItem[] = [
  {
    id: "1",
    severity: "high",
    desc: "inscident",
    timestamp: "2026-03-16 10:30:00",
    options: ["Option 1", "Option 2", "Option 3"],
  },
  {
    id: "2",
    severity: "high",
    desc: "inscident",

    timestamp: "2026-03-16 10:25:00",
    options: ["Option 1", "Option 2"],
  },
  {
    id: "3",
    severity: "medium",
    desc: "inscident",
    timestamp: "2026-03-16 10:20:00",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
  },
  {
    id: "4",
    severity: "medium",
    desc: "inscident",
    timestamp: "2026-03-16 10:15:00",
    options: ["Option 1", "Option 2", "Option 3"],
  },
  {
    id: "5",
    severity: "low",
    desc: "inscident",
    timestamp: "2026-03-16 10:10:00",
    options: ["Option 1", "Option 2"],
  },
  {
    id: "6",
    severity: "low",
    desc: "inscident",
    timestamp: "2026-03-16 10:05:00",
    options: ["Option 1", "option 2"],
  },
];

const severityColors: Record<LogSeverity, string> = {
  high: "red",
  medium: "yellow",
  low: "green",
};

interface HomeSideBarProps {
  collapsed: boolean;
  toggle: () => void;
}

const HomeSideBar: React.FC<HomeSideBarProps> = ({ collapsed, toggle }) => {
  const [hovered, setHovered] = useState(false);

  const listItems = logs.map((log: LogItem) => (
    <Group key={log.id} gap="sm" px="md" py="sm" align="center" fz={"14px"}>
      {/*<Anchor key={severity} href={} target="_blank">*/}
      <Text c="white" ml={2}>
        {log.desc}
      </Text>
      {/*</Anchor>*/}
    </Group>
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
          <Box p="sm">{listItems}</Box>
        </>
      )}
    </Stack>
  );
};

export default HomeSideBar;
