import type { RootCanisterIdText } from "$lib/types/sns";
import type { IcrcTokenMetadataResponse } from "@icp-sdk/canisters/ledger/icrc";
import type { SnsGovernanceDid, SnsSwapDid } from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";

export type QueryRootCanisterId = RootCanisterIdText;

export type QuerySns = {
  rootCanisterId: QueryRootCanisterId;
  certified: boolean;
};

export type QuerySnsMetadata = QuerySns & {
  metadata: SnsGovernanceDid.GetMetadataResponse;
  token: IcrcTokenMetadataResponse;
};

export type QuerySnsSwapState = QuerySns & {
  swapCanisterId: Principal;
  governanceCanisterId: Principal;
  ledgerCanisterId: Principal;
  indexCanisterId: Principal;
  swap: [] | [SnsSwapDid.Swap];
  derived: [] | [SnsSwapDid.DerivedState];
};
