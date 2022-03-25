import type { ICP } from "@dfinity/nns";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";

export interface Account {
  identifier: string;
  balance: ICP;
  // Subaccounts have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
}
