import type { ResponsiveTableRowData } from "$lib/types/responsive-table";
import type { Universe } from "$lib/types/universe";

export interface HotkeyProject {
  universe: Universe;
  neuronCount: number;
}

export interface Hotkey {
  principal: string;
  neuronCount: number;
  // In the order of the universes.
  projects: HotkeyProject[];
}

export interface HotkeysTableRowData extends ResponsiveTableRowData {
  hotkey: Hotkey;
}
