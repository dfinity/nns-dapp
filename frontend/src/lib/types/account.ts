import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { Principal } from "@dfinity/principal";

export type AccountType =
  | "main"
  | "subAccount"
  | "hardwareWallet"
  | "withdrawalAccount";

export type IcpAccountIdentifier = string;

export interface Account {
  identifier: IcpAccountIdentifier;
  // Main and HardwareWallet accounts have Principal
  principal?: Principal;
  balanceE8s: bigint;
  // Subaccounts and HardwareWallets have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
  type: AccountType;
}
