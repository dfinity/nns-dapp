import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { ResponsiveTableRowData } from "$lib/types/responsive-table";

export interface AddressBookTableRowData extends ResponsiveTableRowData {
  namedAddress: NamedAddress;
  rowContext: {
    onEdit: (namedAddress: NamedAddress) => void;
    onDelete: (namedAddress: NamedAddress) => void;
  };
}
