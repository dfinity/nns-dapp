import type { Principal } from "@dfinity/principal";
import type {
  SnsGetMetadataResponse,
  SnsSwap,
  SnsSwapDerivedState,
} from "@dfinity/sns";

export type QueryRootCanisterId = string;

export type QueryCertified = { certified: boolean };

export type QuerySns = { rootCanisterId: QueryRootCanisterId };

export type QuerySnsMetadata = QuerySns & {
  metadata: SnsGetMetadataResponse;
} & QueryCertified;

export type QuerySnsSwapState = QuerySns & {
  swapCanisterId: Principal;
  swap: [] | [SnsSwap];
  derived: [] | [SnsSwapDerivedState];
} & QueryCertified;
