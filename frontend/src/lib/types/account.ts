import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";

export type AccountType = "main" | "subAccount" | "hardwareWallet";
export interface Account {
  identifier: string;
  // Main and HardwareWallet accounts have Principal
  principal?: Principal;
  balance: TokenAmount;
  // Subaccounts and HardwareWallets have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
  type: AccountType;
}
