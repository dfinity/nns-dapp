import type { Principal } from "@dfinity/principal";

export interface ImportedTokenData {
  ledgerCanisterId: Principal;
  indexCanisterId: Principal | undefined;
}
