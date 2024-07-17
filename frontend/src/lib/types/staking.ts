import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
import type { TokenAmountV2 } from "@dfinity/utils";

export type TableProject = {
  rowHref?: string;
  domKey: string;
  title: string;
  logo: string;
  neuronCount: number | undefined;
  stake: TokenAmountV2 | undefined;
};

export type ProjectsTableColumn = ResponsiveTableColumn<TableProject>;
