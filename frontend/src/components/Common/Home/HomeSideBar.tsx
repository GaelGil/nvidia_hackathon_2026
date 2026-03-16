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
  Card,
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

type LogSeverity = "high" | "medium" | "low";

interface LogItem {
  id: string;
  severity: LogSeverity;
  desc: string;
  timestamp: string;
  options: LogOption[];
}

interface LogOption {
  id: string;
  desc: string;
}

const logs: LogItem[] = [
  {
    id: "1",
    severity: "high",
    desc: "inscident",
    timestamp: "2026-03-16 10:30:00",
    options: [{ id: "1", desc: "option1" } as LogOption],
  },
  {
    id: "2",
    severity: "high",
    desc: "inscident",

    timestamp: "2026-03-16 10:25:00",
    options: [
      { id: "1", desc: "option1" } as LogOption,
      { id: "2", desc: "option1" } as LogOption,
    ],
  },
  {
    id: "3",
    severity: "medium",
    desc: "inscident",
    timestamp: "2026-03-16 10:20:00",
    options: [
      { id: "1", desc: "option1" } as LogOption,
      { id: "1", desc: "option1" } as LogOption,
      { id: "1", desc: "option1" } as LogOption,
      { id: "1", desc: "option1" } as LogOption,
    ],
  },
  {
    id: "4",
    severity: "medium",
    desc: "inscident",
    timestamp: "2026-03-16 10:15:00",
    options: [
      { id: "1", desc: "option1" } as LogOption,
      { id: "1", desc: "option1" } as LogOption,
      { id: "1", desc: "option1" } as LogOption,
    ],
  },
  {
    id: "5",
    severity: "low",
    desc: "inscident",
    timestamp: "2026-03-16 10:10:00",
    options: [
      { id: "1", desc: "option1" } as LogOption,
      { id: "1", desc: "option1" } as LogOption,
    ],
  },
  {
    id: "6",
    severity: "low",
    desc: "inscident",
    timestamp: "2026-03-16 10:05:00",
    options: [
      { id: "1", desc: "option1" } as LogOption,
      { id: "1", desc: "option1" } as LogOption,
    ],
  },
  {
    id: "7",
    severity: "low",
    desc: "inscident",
    timestamp: "2026-03-16 10:05:00",
    options: [{ id: "1", desc: "option1" } as LogOption],
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
    <ScrollArea>
      <Card key={log.id} shadow="sm" padding="lg" radius="md" withBorder>
        {/*<Card.Section>
        <Image
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
          height={160}
          alt="Norway"
        />
      </Card.Section>*/}

        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500}>{log.desc}</Text>
          <Text fw={500}>{log.timestamp}</Text>

          <Badge color="pink">On Sale</Badge>
        </Group>

        {/*<Text size="sm" c="dimmed">
        With Fjord Tours you can explore more of the magical fjord landscapes
        with tours and activities on and around the fjords of Norway
      </Text>*/}

        {/*<Button color="blue" fullWidth mt="md" radius="md">
        Book classic tour now
      </Button>*/}
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
