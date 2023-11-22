import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsSummarySwap,
} from "$lib/types/sns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsGetLifecycleResponse,
  SnsParams,
  SnsSwapDerivedState,
  SnsSwapInit,
} from "@dfinity/sns";
import { fromNullable, isNullish } from "@dfinity/utils";

export class SnsSummaryWrapper implements SnsSummary {
  public readonly rootCanisterId: Principal;
  public readonly swapCanisterId: Principal;
  public readonly governanceCanisterId: Principal;
  public readonly ledgerCanisterId: Principal;
  public readonly indexCanisterId: Principal;
  public readonly metadata: SnsSummaryMetadata;
  public readonly token: IcrcTokenMetadata;
  public readonly swap: SnsSummarySwap;
  public readonly derived: SnsSwapDerivedState;
  public readonly init: SnsSwapInit;
  public readonly swapParams: SnsParams;
  public readonly lifecycle: SnsGetLifecycleResponse;

  constructor({
    rootCanisterId,
    swapCanisterId,
    governanceCanisterId,
    ledgerCanisterId,
    indexCanisterId,
    metadata,
    token,
    swap,
    derived,
    init,
    swapParams,
    lifecycle,
  }: {
    rootCanisterId: Principal;
    swapCanisterId: Principal;
    governanceCanisterId: Principal;
    ledgerCanisterId: Principal;
    indexCanisterId: Principal;
    metadata: SnsSummaryMetadata;
    token: IcrcTokenMetadata;
    swap: SnsSummarySwap;
    derived: SnsSwapDerivedState;
    init: SnsSwapInit;
    swapParams: SnsParams;
    lifecycle: SnsGetLifecycleResponse;
  }) {
    this.rootCanisterId = rootCanisterId;
    this.swapCanisterId = swapCanisterId;
    this.governanceCanisterId = governanceCanisterId;
    this.ledgerCanisterId = ledgerCanisterId;
    this.indexCanisterId = indexCanisterId;
    this.metadata = metadata;
    this.token = token;
    this.swap = swap;
    this.derived = derived;
    this.init = init;
    this.swapParams = swapParams;
    this.lifecycle = lifecycle;
  }

  static overrideDerivedState(
    currentSummary: SnsSummaryWrapper,
    newDerivedState: SnsSwapDerivedState
  ): SnsSummaryWrapper {
    return new SnsSummaryWrapper({
      ...currentSummary,
      derived: newDerivedState,
    });
  }

  static overrideLifecycle(
    currentSummary: SnsSummaryWrapper,
    newLifecycle: SnsGetLifecycleResponse
  ): SnsSummaryWrapper {
    const lifecycle = fromNullable(newLifecycle.lifecycle ?? []);
    const saleOpenTimestamp = fromNullable(
      newLifecycle.decentralization_sale_open_timestamp_seconds ?? []
    );
    if (isNullish(lifecycle)) {
      return currentSummary;
    }
    return new SnsSummaryWrapper({
      ...currentSummary,
      swap: {
        ...currentSummary.swap,
        lifecycle,
        decentralization_sale_open_timestamp_seconds: saleOpenTimestamp,
      },
      lifecycle: newLifecycle,
    });
  }
}
