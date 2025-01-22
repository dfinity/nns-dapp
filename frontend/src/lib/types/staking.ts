import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
import type { UnavailableTokenAmount } from "$lib/utils/token.utils";
import type { TokenAmountV2 } from "@dfinity/utils";

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
  availableMaturity: bigint | undefined;
  stakedMaturity: bigint | undefined;
  isStakeLoading?: boolean;
};

export type ProjectsTableColumn = ResponsiveTableColumn<TableProject>;
