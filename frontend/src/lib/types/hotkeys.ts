import type { ResponsiveTableRowData } from "$lib/types/responsive-table";
import type { Universe } from "$lib/types/universe";

export interface HotkeyNeuron {
  // Decimal for an NNS neuron, hex for an SNS neuron.
  neuronId: string;
  // The user can change the hotkeys of the neuron with their principal.
  canChange: boolean;
}

export interface HotkeyProject {
  universe: Universe;
  neurons: HotkeyNeuron[];
}

export interface Hotkey {
  principal: string;
  neuronCount: number;
  // In the order of the universes.
  projects: HotkeyProject[];
}

export interface HotkeyNeuronRef {
  universeId: string;
  // Decimal for an NNS neuron, hex for an SNS neuron.
  neuronId: string;
}

export interface HotkeyChangeResult extends HotkeyNeuronRef {
  success: boolean;
}

export type HotkeyChange =
  | { type: "replace"; principal: string; newPrincipal: string }
  | { type: "remove"; principal: string };

export interface HotkeysTableRowData extends ResponsiveTableRowData {
  hotkey: Hotkey;
  rowContext: {
    onReplace: (hotkey: Hotkey) => void;
    onRemove: (hotkey: Hotkey) => void;
  };
}
