import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type {
  ResponsiveTableColumn,
  ResponsiveTableRowData,
} from "$lib/types/responsive-table";

export interface CanistersTableRowData extends ResponsiveTableRowData {
  // Required here: every canister row links to the canister detail page.
  rowHref: string;
  canister: CanisterDetails;
}

export type CanistersTableColumn = ResponsiveTableColumn<CanistersTableRowData>;
