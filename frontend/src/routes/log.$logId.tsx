import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AppShell,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  Badge,
} from "@mantine/core";
import {
  FiArrowLeft,
  FiPhone,
  FiAlertTriangle,
  FiMapPin,
  FiClock,
  FiTruck,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import HomeSideBar from "../components/Common/Home/HomeSideBar";
import { useDisclosure } from "@mantine/hooks";
import { mockLogs, type LogSeverity } from "@/data/mockLogs";
import { getCameras, type Camera } from "@/api";
import VideoPlayer from "../components/VideoPlayer";

export const Route = createFileRoute("/log/$logId")({
  component: LogDetailPage,
});

function LogDetailPage() {
  const { logId } = Route.useParams();
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const log = mockLogs.find((l) => l.id === logId);
  const [cameras, setCameras] = useState<Camera[]>([]);

  useEffect(() => {
    getCameras(7, 100)
      .then((data) => setCameras(data))
      .catch((err) => console.error("Failed to load cameras:", err));
  }, []);

  const camera = cameras.find((c) => c.id === log?.cameraId);

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
      <AppShell
        layout="alt"
        header={{ height: 60 }}
        navbar={{ width: 60, breakpoint: "sm" }}
        padding="md"
        bg={"black"}
      >
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
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: collapsed ? 60 : 400, breakpoint: "sm" }}
      padding="md"
      bg={"black"}
    >
      <AppShell.Navbar p="md" withBorder={false} bg={"black"}>
        <HomeSideBar collapsed={collapsed} toggle={toggleCollapsed} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container size="xl">
          <Stack gap="xl">
            <Flex align="center" justify="space-between">
              <Group>
                <Link to="/">
                  <Button
                    leftSection={<FiArrowLeft size={18} />}
                    variant="subtle"
                    c="white"
                  >
                    Back to Map
                  </Button>
                </Link>
              </Group>
              {log.severity === "high" && (
                <Button
                  leftSection={<FiPhone size={18} />}
                  color="red"
                  size="lg"
                  onClick={handleCall911}
                >
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
                    <Text c="dimmed" fz="sm">
                      {log.timestamp}
                    </Text>
                  </Flex>
                  {log.route && (
                    <Flex align="center" gap={6}>
                      <FiMapPin size={14} color="#999" />
                      <Text c="dimmed" fz="sm">
                        {log.route} {log.direction}
                      </Text>
                    </Flex>
                  )}
                  {log.county && (
                    <Text c="dimmed" fz="sm">
                      📍 {log.county}
                    </Text>
                  )}
                  {log.vehiclesInvolved !== undefined &&
                    log.vehiclesInvolved > 0 && (
                      <Flex align="center" gap={6}>
                        <FiTruck size={14} color="#999" />
                        <Text c="dimmed" fz="sm">
                          {log.vehiclesInvolved} vehicle
                          {log.vehiclesInvolved > 1 ? "s" : ""}
                        </Text>
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
                        <Badge
                          key={i}
                          color="yellow"
                          variant="outline"
                          size="sm"
                        >
                          {lane}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                )}

                {/* Recommended response */}
                {log.recommendedResponse &&
                  log.recommendedResponse.length > 0 && (
                    <Box>
                      <Text c="orange" fz="sm" fw={600} mb={4}>
                        <FiAlertTriangle
                          size={14}
                          style={{ marginRight: 4, verticalAlign: "middle" }}
                        />
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
                    <Box
                      style={{
                        height: 400,
                        backgroundColor: "#000",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <VideoPlayer
                        streamUrl={camera.stream_url || ""}
                        imageUrl={camera.image_url}
                        alt={camera.name}
                      />
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
                    </Stack>
                  </Grid.Col>
                </Grid>
              ) : (
                <Flex align="center" justify="center" h={400}>
                  <Text c="dimmed">
                    Camera not found for ID: {log.cameraId}
                  </Text>
                </Flex>
              )}
            </Card>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
