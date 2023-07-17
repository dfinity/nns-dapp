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

export interface Account {
  // TODO: IcpAccountIdentifierText to be removed
  identifier: IcpAccountIdentifierText | IcrcAccountIdentifierText;
  // Main and HardwareWallet accounts have Principal
  principal?: Principal;
  balanceE8s: bigint;
  // Subaccounts and HardwareWallets have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
  type: AccountType;
}
