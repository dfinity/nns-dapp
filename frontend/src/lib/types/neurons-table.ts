import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
import type { TokenAmountV2 } from "@dfinity/utils";

export type TableNeuron = {
  rowHref?: string;
  domKey: string;
  neuronId: string;
  stake: TokenAmountV2;
  dissolveDelaySeconds: bigint;
};

export type NeuronsTableColumn = ResponsiveTableColumn<TableNeuron>;
