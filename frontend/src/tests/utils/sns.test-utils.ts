import { snsAggregatorIncludingAbortedProjectsStore } from "$lib/stores/sns-aggregator.store";
import { snsDerivedStateStore } from "$lib/stores/sns-derived-state.store";
import { snsLifecycleStore } from "$lib/stores/sns-lifecycle.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  CachedNervousSystemParametersDto,
  CachedSnsDto,
} from "$lib/types/sns-aggregator";
import { aggregatorSnsMockWith } from "$tests/mocks/sns-aggregator.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import type { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle, type SnsNervousSystemFunction } from "@dfinity/sns";

export const setSnsProjects = (
  params: {
    rootCanisterId?: Principal;
    governanceCanisterId?: Principal;
    ledgerCanisterId?: Principal;
    indexCanisterId?: Principal;
    swapCanisterId?: Principal;
    lifecycle?: SnsSwapLifecycle;
    certified?: boolean;
    restrictedCountries?: string[];
    directParticipantCount?: [] | [bigint];
    projectName?: string;
    tokenMetadata?: Partial<IcrcTokenMetadata>;
    nervousFunctions?: SnsNervousSystemFunction[];
    swapDueTimestampSeconds?: number;
    swapOpenTimestampSeconds?: number;
    nnsProposalId?: number;
    totalTokenSupply?: bigint;
    nervousSystemParameters?: CachedNervousSystemParametersDto;
    neuronMinimumDissolveDelayToVoteSeconds?: bigint;
    maxDissolveDelaySeconds?: bigint;
    maxDissolveDelayBonusPercentage?: number;
    maxAgeBonusPercentage?: number;
    neuronMinimumStakeE8s?: bigint;
  }[]
) => {
  const aggregatorProjects = params.map((params, index) => {
    return aggregatorSnsMockWith({
      rootCanisterId:
        params.rootCanisterId?.toText() ?? principal(index).toText(),
      governanceCanisterId: params.governanceCanisterId?.toText(),
      ledgerCanisterId: params.ledgerCanisterId?.toText(),
      indexCanisterId: params.indexCanisterId?.toText(),
      swapCanisterId: params.swapCanisterId?.toText(),
      lifecycle: params.lifecycle ?? SnsSwapLifecycle.Committed,
      restrictedCountries: params.restrictedCountries,
      directParticipantCount: params.directParticipantCount,
      projectName: params.projectName,
      tokenMetadata: params.tokenMetadata,
      nervousFunctions: params.nervousFunctions,
      swapDueTimestampSeconds: params.swapDueTimestampSeconds,
      swapOpenTimestampSeconds: params.swapOpenTimestampSeconds,
      nnsProposalId: params.nnsProposalId,
      totalTokenSupply: params.totalTokenSupply,
      nervousSystemParameters: params.nervousSystemParameters,
      neuronMinimumDissolveDelayToVoteSeconds:
        params.neuronMinimumDissolveDelayToVoteSeconds,
      maxDissolveDelaySeconds: params.maxDissolveDelaySeconds,
      maxDissolveDelayBonusPercentage: params.maxDissolveDelayBonusPercentage,
      maxAgeBonusPercentage: params.maxAgeBonusPercentage,
      neuronMinimumStakeE8s: params.neuronMinimumStakeE8s,
    });
  });
  snsLifecycleStore.reset();
  snsDerivedStateStore.reset();
  snsAggregatorIncludingAbortedProjectsStore.setData(aggregatorProjects);
};

export const resetSnsProjects = () => {
  snsLifecycleStore.reset();
  snsDerivedStateStore.reset();
  snsAggregatorIncludingAbortedProjectsStore.reset();
};

export const setProdSnsProjects = async () => {
  const allAggregatorData: CachedSnsDto[] = [];
  let page = 0;
  try {
    for (;;) {
      const moduleData = (await import(
        `../workflows/Launchpad/sns-agg-page-${page}.json`
      )) as unknown as { default: CachedSnsDto[] };
      if (moduleData.default.length === 0) {
        break;
      }
      allAggregatorData.push(...moduleData.default);
      page++;
    }
  } catch (e) {
    if (page === 0) {
      throw e;
    }
    // Ignore because we've reached past the last page.
  }
  snsLifecycleStore.reset();
  snsDerivedStateStore.reset();
  snsAggregatorIncludingAbortedProjectsStore.setData(allAggregatorData);
};
