import type {
  ResponsiveTableColumn,
  ResponsiveTableOrder,
} from "$lib/types/responsive-table";
import type { ApyAmount } from "$lib/types/staking";
import type { NeuronTagData } from "$lib/utils/neuron.utils";
import type { Comparator } from "$lib/utils/sort.utils";
import type { NeuronState } from "@dfinity/nns";
import type { TokenAmountV2 } from "@dfinity/utils";

export type TableNeuron = {
  rowHref?: string;
  domKey: string;
  neuronId: string;
  stake: TokenAmountV2;
  stakeInUsd: number | undefined;
  apy?: ApyAmount | undefined;
  availableMaturity: bigint;
  stakedMaturity: bigint;
  dissolveDelaySeconds: bigint;
  state: NeuronState;
  tags: NeuronTagData[];
  isPublic: boolean;
  voteDelegationState: NeuronsTableVoteDelegationState;
};

export type NeuronsTableColumnId =
  | "id"
  | "stake"
  | "apy"
  | "maturity"
  | "dissolveDelay"
  | "voteDelegation"
  | "state";

// Should define a partial ordering on TableNeuron by return -1 if a < b, +1 if
// a > b and 0 if a and b are equivalent.
export type TableNeuronComparator = Comparator<TableNeuron>;

export type NeuronsTableColumn = ResponsiveTableColumn<
  TableNeuron,
  NeuronsTableColumnId
>;

export type NeuronsTableOrder = ResponsiveTableOrder<NeuronsTableColumnId>;

export const NeuronsTableVoteDelegationStateOrder = [
  "none",
  "some",
  "all",
] as const;
// Since `NeuronsTableVoteDelegationStateOrder` is a tuple of exact string literals,
// we can get the type of any value that can be indexed by a number.
export type NeuronsTableVoteDelegationState =
  (typeof NeuronsTableVoteDelegationStateOrder)[number];
