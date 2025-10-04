import type { Principal } from "@icp-sdk/core/principal";

export interface ImportedTokenData {
  ledgerCanisterId: Principal;
  indexCanisterId: Principal | undefined;
}
