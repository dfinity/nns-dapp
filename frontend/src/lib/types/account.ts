import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Principal } from "@dfinity/principal";

export type AccountType =
  | "main"
  | "subAccount"
  | "hardwareWallet"
  | "withdrawalAccount";

export type IcpAccountIdentifierText = string;

export interface Account {
  identifier: IcpAccountIdentifierText;
  // Main and HardwareWallet accounts have Principal
  principal?: Principal;
  balanceE8s: bigint;
  // Subaccounts and HardwareWallets have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
  type: AccountType;
}
