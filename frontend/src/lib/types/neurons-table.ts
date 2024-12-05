import type {
  ResponsiveTableColumn,
  ResponsiveTableOrder,
} from "$lib/types/responsive-table";
import type { NeuronTagData } from "$lib/utils/neuron.utils";
import type { Comparator } from "$lib/utils/sort.utils";
import type { NeuronState } from "@dfinity/nns";
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
  tags: NeuronTagData[];
  isPublic: boolean;
};

export type NeuronsTableColumnId =
  | "id"
  | "stake"
  | "maturity"
  | "dissolveDelay"
  | "state";

// Should define a partial ordering on TableNeuron by return -1 if a < b, +1 if
// a > b and 0 if a and b are equivalent.
export type TableNeuronComparator = Comparator<TableNeuron>;

export type NeuronsTableColumn = ResponsiveTableColumn<
  TableNeuron,
  NeuronsTableColumnId
>;

export type NeuronsTableOrder = ResponsiveTableOrder<NeuronsTableColumnId>;
