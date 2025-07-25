import type {
  ResponsiveTableColumn,
  ResponsiveTableOrder,
} from "$lib/types/responsive-table";
import type { APY_CALC_ERROR } from "$lib/utils/staking-rewards.utils";
import type { UnavailableTokenAmount } from "$lib/utils/token.utils";
import type { TokenAmountV2 } from "@dfinity/utils";

export type ApyAmount = {
  cur: number;
  max: number;
  error?: APY_CALC_ERROR;
};

export type TableProject = {
  rowHref?: string;
  domKey: string;
  universeId: string;
  title: string;
  logo: string;
  tokenSymbol: string;
  neuronCount: number | undefined;
  stake: TokenAmountV2 | UnavailableTokenAmount;
  stakeInUsd: number | undefined;
  apy?: ApyAmount | undefined;
  availableMaturity: bigint | undefined;
  stakedMaturity: bigint | undefined;
  isStakeLoading?: boolean;
};

export type ProjectsTableColumnId = "title" | "apy" | "stake" | "neurons";

export type ProjectsTableColumn = ResponsiveTableColumn<
  TableProject,
  ProjectsTableColumnId
>;

export type ProjectsTableOrder = ResponsiveTableOrder<ProjectsTableColumnId>;
