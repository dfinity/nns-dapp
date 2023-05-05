import type { SubAccountArray } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";

export type AccountType =
  | "main"
  | "subAccount"
  | "hardwareWallet"
  | "withdrawalAccount";

export type AccountIdentifierText = string;

export interface Account {
  identifier: AccountIdentifierText;
  // Main and HardwareWallet accounts have Principal
  principal?: Principal;
  /**
   * TODO: integrate ckBTC fee
   * @deprecated to be replaced with balanceE8s - token to be handled with tokensStore
   */
  balance: TokenAmount;
  // Subaccounts and HardwareWallets have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
  type: AccountType;
}
