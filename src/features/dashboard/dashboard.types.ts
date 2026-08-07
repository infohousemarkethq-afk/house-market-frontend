import type { IconSvgElement } from "@hugeicons/react";

export interface DashboardTile {
  label: string;
  value: string;
  caption: string;
  icon: IconSvgElement;
  /** Set on numbers that depend on features still being built. */
  planned?: boolean;
}

export interface OccupancyBar {
  unitName: string;
  pct: number;
}

export type ChangeoverKind = "Checking out" | "Checking in" | "Blocked";

export interface Changeover {
  title: string;
  detail: string;
  kind: ChangeoverKind;
}

export interface ActivityItem {
  text: string;
  when: string;
  tone: "green" | "tan" | "ink" | "stone";
}
