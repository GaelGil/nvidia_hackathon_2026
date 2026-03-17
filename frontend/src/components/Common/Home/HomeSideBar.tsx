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
  Loader,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FiArrowRight, FiColumns, FiPhone, FiEye, FiRefreshCw } from "react-icons/fi";
import { LOGO, PROJECT_NAME } from "@/const";
import {
  type IncidentReport,
  getHealth,
  getIncidents,
  severityColor,
  severityLabel,
  startMonitoring,
  stopMonitoring,
} from "@/api";

// ---------------------------------------------------------------------------
// Severity badge
// ---------------------------------------------------------------------------

const SEVERITY_BADGE_COLOR: Record<string, string> = {
  high: "red",
  medium: "orange",
  low: "green",
};

function SeverityBadge({ severity }: { severity: number }) {
  const label = severityLabel(severity);
  return (
    <Badge color={SEVERITY_BADGE_COLOR[label]} size="xs" variant="filled">
      {label.toUpperCase()} {severity}/10
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Single incident card (from live API)
// ---------------------------------------------------------------------------

function IncidentCard({ report }: { report: IncidentReport }) {
  const timeStr = new Date(report.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      style={{
        borderColor: severityColor(report.severity),
        background: "#0a0a0a",
      }}
    >
      <Group justify="space-between" mb={4}>
        <Text fw={600} fz="xs" c="white" style={{ flex: 1 }}>
          {report.camera_name || report.camera_id}
        </Text>
        <Text fz="xs" c="dimmed">
          {timeStr}
        </Text>
      </Group>

      <Group mb={6}>
        <SeverityBadge severity={report.severity} />
        <Badge color="gray" size="xs" variant="outline">
          {report.incident_type.replace(/_/g, " ")}
        </Badge>
        {report.injuries_likely && (
          <Badge color="red" size="xs" variant="light">
            injuries
          </Badge>
        )}
      </Group>

      <Text fz="xs" c="dimmed" mb={6} lineClamp={2}>
        {report.description}
      </Text>

      {report.recommended_response.length > 0 && (
        <Box>
          <Text fz="xs" c="yellow" fw={500} mb={2}>
            Recommended actions:
          </Text>
          <Stack gap={2}>
            {report.recommended_response.map((action, i) => (
              <Text key={i} fz="xs" c="dimmed">
                → {action.replace(/_/g, " ")}
              </Text>
            ))}
          </Stack>
        </Box>
      )}

      <Text fz="xs" c="dimmed" mt={4}>
        Confidence: {Math.round(report.confidence * 100)}%
        {report.vehicles_involved > 0 &&
          ` · ${report.vehicles_involved} vehicle${report.vehicles_involved > 1 ? "s" : ""}`}
      </Text>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Demo log items (for "View Details" link)
// ---------------------------------------------------------------------------

type LogSeverity = "high" | "medium" | "low";

interface DemoLog {
  id: string;
  severity: LogSeverity;
  desc: string;
  timestamp: string;
}

const demoLogs: DemoLog[] = [
  {
    id: "1",
    severity: "high",
    desc: "🚨 Multi-vehicle collision — I-80 Bay Bridge",
    timestamp: "2026-03-16 17:30:00",
  },
  {
    id: "2",
    severity: "high",
    desc: "🚨 Pedestrian incident — Golden Gate Bridge",
    timestamp: "2026-03-16 17:25:00",
  },
  {
    id: "3",
    severity: "medium",
    desc: "⚠ Stalled vehicle blocking lane — US-101 SB",
    timestamp: "2026-03-16 17:20:00",
  },
  {
    id: "4",
    severity: "medium",
    desc: "⚠ Debris on roadway — I-280 NB Daly City",
    timestamp: "2026-03-16 17:15:00",
  },
  {
    id: "5",
    severity: "low",
    desc: "✓ Normal traffic flow — I-101 NB",
    timestamp: "2026-03-16 17:10:00",
  },
  {
    id: "6",
    severity: "low",
    desc: "✓ Dense fog advisory — Golden Gate",
    timestamp: "2026-03-16 17:05:00",
  },
  {
    id: "7",
    severity: "low",
    desc: "✓ Construction zone — I-80 EB",
    timestamp: "2026-03-16 17:00:00",
  },
];

const SEVERITY_COLOR_MAP: Record<LogSeverity, string> = {
  high: "red",
  medium: "orange",
  low: "green",
};

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface HomeSideBarProps {
  collapsed: boolean;
  toggle: () => void;
}

const HomeSideBar: React.FC<HomeSideBarProps> = ({ collapsed, toggle }) => {
  const [hovered, setHovered] = useState(false);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [agentReady, setAgentReady] = useState(false);

  // Fetch health once on mount
  useEffect(() => {
    getHealth()
      .then((h) => {
        setAgentReady(h.agent_ready);
        setMonitoring(h.monitoring_active);
      })
      .catch(() => { });
  }, []);

  // Poll incidents every 10 seconds
  useEffect(() => {
    async function fetchIncidents() {
      setLoading(true);
      try {
        const data = await getIncidents(0, 30);
        setIncidents(data);
        setError(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load incidents");
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10_000);
    return () => clearInterval(interval);
  }, []);

  async function toggleMonitoring() {
    try {
      if (monitoring) {
        await stopMonitoring();
        setMonitoring(false);
      } else {
        await startMonitoring([4], 10, 30);
        setMonitoring(true);
      }
    } catch (e: unknown) {
      console.error("Monitor toggle failed:", e);
    }
  }

  // Separate active incidents from normal reports
  const activeIncidents = incidents.filter((i) => i.is_incident);
  const normalReports = incidents.filter((i) => !i.is_incident);

  return (
    <Stack h="100%" style={{ overflow: "hidden" }}>
      {/* Header controls */}
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
              <Text fw={700} fz="sm" c="white">
                {PROJECT_NAME}
              </Text>
            </Flex>
            <Flex align="center" gap={4}>
              {loading && <Loader size="xs" color="green" />}
              <ActionIcon
                onClick={toggleMonitoring}
                variant="subtle"
                size="sm"
                title={monitoring ? "Stop monitoring" : "Start monitoring"}
              >
                <FiRefreshCw
                  size={14}
                  color={monitoring ? "#00ff88" : "gray"}
                  style={
                    monitoring
                      ? {
                        animation: "spin 2s linear infinite",
                      }
                      : {}
                  }
                />
              </ActionIcon>
              <ActionIcon onClick={toggle} variant="subtle" size="sm">
                <FiColumns size={18} color="white" />
              </ActionIcon>
            </Flex>
          </>
        )}
      </Flex>

      {!collapsed && (
        <ScrollArea style={{ flex: 1 }} px="sm">
          <Stack gap="sm" pb="md">
            {/* Status bar */}
            <Flex align="center" gap="xs" px={4}>
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: agentReady ? "#00ff88" : "#ff4444",
                }}
              />
              <Text fz="xs" c="dimmed">
                {agentReady ? "Nemotron agent online" : "Agent offline — set NVIDIA_API_KEY"}
              </Text>
            </Flex>

            {monitoring && (
              <Text fz="xs" c="green" px={4}>
                🟢 Auto-monitoring active
              </Text>
            )}

            {error && (
              <Text fz="xs" c="red" px={4}>
                ⚠ Backend unreachable: {error}
              </Text>
            )}

            {/* Active incidents from live API */}
            {activeIncidents.length > 0 && (
              <>
                <Text fz="xs" fw={700} c="red" px={4}>
                  🚨 ACTIVE INCIDENTS ({activeIncidents.length})
                </Text>
                {activeIncidents.map((r) => (
                  <IncidentCard key={r.incident_id} report={r} />
                ))}
              </>
            )}

            {/* Normal / low-severity reports */}
            {normalReports.length > 0 && (
              <>
                <Text fz="xs" fw={600} c="dimmed" px={4} mt={4}>
                  Recent scans — no incidents
                </Text>
                {normalReports.slice(0, 5).map((r) => (
                  <IncidentCard key={r.incident_id} report={r} />
                ))}
              </>
            )}

            {/* Empty state */}
            {incidents.length === 0 && !loading && !error && (
              <Box px={4} mt={8}>
                <Text fz="sm" c="dimmed" ta="center">
                  No incidents yet.
                </Text>
                <Text fz="xs" c="dimmed" ta="center" mt={4}>
                  Click a camera on the map and press{" "}
                  <b>Scan with Nemotron</b>, or start the monitoring loop.
                </Text>
                {!monitoring && (
                  <Button
                    mt="md"
                    size="xs"
                    fullWidth
                    variant="outline"
                    color="green"
                    onClick={toggleMonitoring}
                    disabled={!agentReady}
                  >
                    Start auto-monitoring
                  </Button>
                )}
              </Box>
            )}

            {/* ---- Demo Log Cards (clickable → detail page) ---- */}
            <Text fz="xs" fw={700} c="white" px={4} mt="md">
              📋 INCIDENT LOG
            </Text>
            {demoLogs.map((log) => (
              <Link
                key={log.id}
                to="/log/$logId"
                params={{ logId: log.id }}
                style={{ textDecoration: "none" }}
              >
                <Card
                  shadow="sm"
                  padding="sm"
                  radius="md"
                  withBorder
                  style={{
                    cursor: "pointer",
                    background: "#0a0a0a",
                    borderColor: SEVERITY_COLOR_MAP[log.severity] === "red" ? "#ff4444" : SEVERITY_COLOR_MAP[log.severity] === "orange" ? "#ffaa00" : "#00cc66",
                  }}
                >
                  <Group justify="space-between" mb={4}>
                    <Text fw={600} fz="xs" c="white" style={{ flex: 1 }}>
                      {log.desc}
                    </Text>
                    <Badge color={SEVERITY_COLOR_MAP[log.severity]} size="xs">
                      {log.severity.toUpperCase()}
                    </Badge>
                  </Group>

                  <Group justify="space-between">
                    <Text fz="xs" c="dimmed">
                      {log.timestamp}
                    </Text>
                    <Group gap={4}>
                      {log.severity === "high" && (
                        <Button
                          leftSection={<FiPhone size={12} />}
                          color="red"
                          variant="filled"
                          size="compact-xs"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open("tel:911", "_blank");
                          }}
                        >
                          911
                        </Button>
                      )}
                      <Button
                        leftSection={<FiEye size={12} />}
                        variant="light"
                        size="compact-xs"
                      >
                        View Details
                      </Button>
                    </Group>
                  </Group>
                </Card>
              </Link>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Stack>
  );
};

export default HomeSideBar;
