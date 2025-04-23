
export const ADDITIONAL_TEAMS = [
  { id: "Enterprise", name: "Enterprise" },
  { id: "SMB", name: "SMB" },
  { id: "Mid-Market", name: "Mid Market" },
];

export type DashboardSectionKey = "metrics" | "client-status" | "performance" | "health-scores" | "health-trends";

export const defaultSections: { key: DashboardSectionKey; label: string }[] = [
  { key: "metrics", label: "Key Metrics Overview" },
  { key: "client-status", label: "Client Status Metrics" },
  { key: "performance", label: "Team Performance" },
  { key: "health-scores", label: "Health Score Sheet" },
  { key: "health-trends", label: "Health Trends" },
];
