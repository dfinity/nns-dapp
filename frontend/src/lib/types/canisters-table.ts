import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type {
  ResponsiveTableColumn,
  ResponsiveTableRowData,
} from "$lib/types/responsive-table";

export interface CanistersTableRowData extends ResponsiveTableRowData {
  rowHref: string;
  domKey: string;
  canister: CanisterDetails;
}

export type CanistersTableColumn = ResponsiveTableColumn<CanistersTableRowData>;
