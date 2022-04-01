import type { ICP } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";

export interface Account {
  identifier: string;
  // Main account has Principal
  principal?: Principal;
  balance: ICP;
  // Subaccounts have name and subAccount
  name?: string;
  subAccount?: SubAccountArray;
}
