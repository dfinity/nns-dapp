import type { RootCanisterIdText } from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsGetMetadataResponse,
  SnsSwap,
  SnsSwapDerivedState,
  SnsTokenMetadataResponse,
} from "@dfinity/sns";

export type QueryRootCanisterId = RootCanisterIdText;

export type QuerySns = {
  rootCanisterId: QueryRootCanisterId;
  certified: boolean;
};

export type QuerySnsMetadata = QuerySns & {
  metadata: SnsGetMetadataResponse;
  token: SnsTokenMetadataResponse;
};

export type QuerySnsSwapState = QuerySns & {
  swapCanisterId: Principal;
  governanceCanisterId: Principal;
  swap: [] | [SnsSwap];
  derived: [] | [SnsSwapDerivedState];
};
