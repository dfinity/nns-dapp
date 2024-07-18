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
  SnsSwapLifecycle,
} from "@dfinity/sns";
import { fromDefinedNullable, fromNullable, isNullish } from "@dfinity/utils";

export class SnsSummaryWrapper implements SnsSummary {
  private readonly summary: SnsSummary;

  constructor(summary: SnsSummary) {
    this.summary = summary;
  }
  get rootCanisterId(): Principal {
    return this.summary.rootCanisterId;
  }
  get swapCanisterId(): Principal {
    return this.summary.swapCanisterId;
  }
  get governanceCanisterId(): Principal {
    return this.summary.governanceCanisterId;
  }
  get ledgerCanisterId(): Principal {
    return this.summary.ledgerCanisterId;
  }
  get indexCanisterId(): Principal {
    return this.summary.indexCanisterId;
  }
  get metadata(): SnsSummaryMetadata {
    return this.summary.metadata;
  }
  get token(): IcrcTokenMetadata {
    return this.summary.token;
  }
  get swap(): SnsSummarySwap {
    return this.summary.swap;
  }
  get derived(): SnsSwapDerivedState {
    return this.summary.derived;
  }
  get init(): SnsSwapInit {
    return this.summary.init;
  }
  get swapParams(): SnsParams {
    return this.summary.swapParams;
  }
  get lifecycle(): SnsGetLifecycleResponse {
    return this.summary.lifecycle;
  }

  getLifecycle(): SnsSwapLifecycle {
    // lifecycle was added as an optional field for backwards compatibility but
    // is always defined in current SNSes.
    return fromDefinedNullable(this.lifecycle.lifecycle);
  }

  getSwapDueTimestampSeconds(): bigint {
    return this.swap.params.swap_due_timestamp_seconds;
  }

  getMinIcpE8s(): bigint {
    return this.swap.params.min_icp_e8s;
  }

  getMaxIcpE8s(): bigint {
    return this.swap.params.max_icp_e8s;
  }

  getMinParticipants(): number {
    return this.swap.params.min_participants;
  }

  getMinParticipantIcpE8s(): bigint {
    return this.swap.params.min_participant_icp_e8s;
  }

  getMaxParticipantIcpE8s(): bigint {
    return this.swap.params.max_participant_icp_e8s;
  }

  getSnsTokenE8s(): bigint {
    return this.swap.params.sns_token_e8s;
  }

  public overrideDerivedState(
    newDerivedState: SnsSwapDerivedState
  ): SnsSummaryWrapper {
    return new SnsSummaryWrapper({
      ...this.summary,
      derived: newDerivedState,
    });
  }

  public overrideLifecycleResponse(
    newLifecycle: SnsGetLifecycleResponse
  ): SnsSummaryWrapper {
    const lifecycle = fromNullable(newLifecycle.lifecycle ?? []);
    const saleOpenTimestamp = fromNullable(
      newLifecycle.decentralization_sale_open_timestamp_seconds ?? []
    );
    if (isNullish(lifecycle)) {
      return this;
    }
    return new SnsSummaryWrapper({
      ...this.summary,
      swap: {
        ...this.summary.swap,
        lifecycle,
        decentralization_sale_open_timestamp_seconds: saleOpenTimestamp,
      },
      lifecycle: newLifecycle,
    });
  }

  public overrideLifecycle(lifecycle: SnsSwapLifecycle): SnsSummaryWrapper {
    return this.overrideLifecycleResponse({
      ...this.lifecycle,
      lifecycle: [lifecycle],
    });
  }

  public override(summary: Partial<SnsSummary>): SnsSummaryWrapper {
    return new SnsSummaryWrapper({
      ...this.summary,
      ...summary,
    });
  }
}
