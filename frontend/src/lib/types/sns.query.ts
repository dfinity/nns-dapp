import type { Principal } from "@dfinity/principal";
import type {
  SnsGetMetadataResponse,
  SnsSwap,
  SnsSwapDerivedState,
} from "@dfinity/sns";

export type QueryRootCanisterId = string;

export type QueryCertified = { certified: boolean };

export type QuerySnsMetadata = {
  rootCanisterId: QueryRootCanisterId;
} & SnsGetMetadataResponse &
  QueryCertified;

export type QuerySnsSwapState = {
  rootCanisterId: QueryRootCanisterId;
  swapCanisterId: Principal;
  swap: [] | [SnsSwap];
  derived: [] | [SnsSwapDerivedState];
} & QueryCertified;
