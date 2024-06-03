import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
import type { NeuronState } from "@dfinity/nns";
import type { TokenAmountV2 } from "@dfinity/utils";

export type TableNeuron = {
  rowHref?: string;
  domKey: string;
  neuronId: string;
  stake: TokenAmountV2;
  dissolveDelaySeconds: bigint;
  state: NeuronState;
};

// Should define a partial ordering on TableNeuron by return -1 if a < b, +1 if
// a > b and 0 if a and b are equivalent.
export type TableNeuronComparator = (a: TableNeuron, b: TableNeuron) => number;

export type NeuronsTableColumn = ResponsiveTableColumn<TableNeuron>;
