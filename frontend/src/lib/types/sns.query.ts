import type { RootCanisterIdText } from "$lib/types/sns";
import type { IcrcTokenMetadataResponse } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import type {
  SnsGetMetadataResponse,
  SnsSwap,
  SnsSwapDerivedState,
} from "@dfinity/sns";

export type QueryRootCanisterId = RootCanisterIdText;

export type QuerySns = {
  rootCanisterId: QueryRootCanisterId;
  certified: boolean;
};

export type QuerySnsMetadata = QuerySns & {
  metadata: SnsGetMetadataResponse;
  token: IcrcTokenMetadataResponse;
};

export type QuerySnsSwapState = QuerySns & {
  swapCanisterId: Principal;
  governanceCanisterId: Principal;
  ledgerCanisterId: Principal;
  swap: [] | [SnsSwap];
  derived: [] | [SnsSwapDerivedState];
};
