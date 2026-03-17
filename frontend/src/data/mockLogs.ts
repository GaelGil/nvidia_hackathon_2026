export type LogSeverity = "high" | "medium" | "low";

export interface LogOption {
  id: string;
  desc: string;
}

export interface MockLog {
  id: string;
  severity: LogSeverity;
  desc: string;
  timestamp: string;
  options: LogOption[];
  cameraId: string;
  detailedDesc: string;
  route: string;
  direction: string;
  county: string;
  vehiclesInvolved: number;
  lanesAffected: string[];
  recommendedResponse: string[];
}

export const mockLogs: MockLog[] = [
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
    cameraId: "D7-I-110-1",
    detailedDesc:
      "Nemotron VL detected a three-vehicle pile-up in Lane 2 and Lane 3 of I-80 westbound on the Bay Bridge approach. Lead SUV shows deployed airbags. Second vehicle (sedan) rear-ended the SUV at significant speed, third vehicle (pickup) jack-knifed attempting to avoid collision. Debris field spans ~50 meters. Emergency flashers visible on all three vehicles. Traffic behind the scene is at a complete standstill stretching approximately 2.5 miles east toward the toll plaza. No visible fire, but fluid leaks observed on pavement. Fog is reducing visibility to ~200 meters.",
    route: "I-80",
    direction: "Westbound",
    county: "Alameda / San Francisco",
    vehiclesInvolved: 3,
    lanesAffected: ["Lane 2", "Lane 3", "Shoulder"],
    recommendedResponse: [
      "dispatch_ambulance",
      "dispatch_chp",
      "dispatch_tow",
      "activate_CMS_signs",
      "request_traffic_break",
    ],
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
    cameraId: "D7-I-5-2",
    detailedDesc:
      "Nemotron VL flagged an anomaly near the north tower — a pedestrian has been struck by a vehicle in the right-most travel lane. The victim appears conscious but lying on the road surface. A silver sedan is stopped 20 feet ahead with the driver exiting the vehicle. Bridge patrol has partially blocked the lane. Traffic is merging left, causing a bottleneck extending into Marin County. Light rain is present.",
    route: "US-101",
    direction: "Southbound",
    county: "Marin / San Francisco",
    vehiclesInvolved: 1,
    lanesAffected: ["Lane 3 (right)"],
    recommendedResponse: [
      "dispatch_ambulance",
      "dispatch_chp",
      "close_lanes",
      "notify_caltrans_tmc",
    ],
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
    cameraId: "D7-I-5-17",
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
    cameraId: "D7-I-5-25",
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
    cameraId: "D7-I-5-27",
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
    cameraId: "D7-I-5-31",
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
    cameraId: "D7-I-5-37",
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
