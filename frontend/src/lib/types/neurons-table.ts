import type {
  Comparator,
  ResponsiveTableColumn,
} from "$lib/types/responsive-table";
import type { NeuronState, NeuronVisibility, Option } from "@dfinity/nns";
import type { TokenAmountV2 } from "@dfinity/utils";

export type TableNeuron = {
  rowHref?: string;
  domKey: string;
  neuronId: string;
  stake: TokenAmountV2;
  availableMaturity: bigint;
  stakedMaturity: bigint;
  dissolveDelaySeconds: bigint;
  state: NeuronState;
  tags: string[];
  visibility: Option<NeuronVisibility>;
};

// Should define a partial ordering on TableNeuron by return -1 if a < b, +1 if
// a > b and 0 if a and b are equivalent.
export type TableNeuronComparator = Comparator<TableNeuron>;

export type NeuronsTableColumn = ResponsiveTableColumn<TableNeuron>;
