import groupsJson from "./groups.json";

export interface GroupConfig {
  name: string;
  url: string;
  priority: number;
}

export function loadGroups(): GroupConfig[] {
  const groups = groupsJson as GroupConfig[];
  return [...groups].sort((a, b) => b.priority - a.priority);
}
