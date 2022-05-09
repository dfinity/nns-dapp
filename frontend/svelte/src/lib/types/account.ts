import type { ICP } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";

export type AccountType = "main" | "subAccount" | "hardwareWallet";
export interface Account {
  identifier: string;
  // Main and HardwareWallet accounts have Principal
  principal?: Principal;
  balance: ICP;
  // Subaccounts and HardwareWallets have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
  type: AccountType;
}
