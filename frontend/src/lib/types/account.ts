import type {
  AccountIdentifierString,
  SubAccountArray,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { IcrcAccountIdentifierText } from "$lib/types/icrc";
import type { Principal } from "@dfinity/principal";

export type AccountType =
  | "main"
  | "subAccount"
  | "hardwareWallet"
  | "withdrawalAccount";

export type IcpAccountIdentifierText = AccountIdentifierString;

// TODO: IcpAccountIdentifierText to be removed and inline type
export type AccountIdentifierText =
  | IcpAccountIdentifierText
  | IcrcAccountIdentifierText;

export interface Account {
  identifier: AccountIdentifierText;
  // Main and HardwareWallet accounts have Principal
  principal?: Principal;
  balanceE8s: bigint;
  // Subaccounts and HardwareWallets have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
  type: AccountType;
}
