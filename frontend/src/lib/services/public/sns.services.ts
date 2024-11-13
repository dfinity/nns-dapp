import { snsAggregatorApiService } from "$lib/api-services/sns-aggregator.api-service";
import { queryProposals } from "$lib/api/proposals.api";
import { buildAndStoreWrapper } from "$lib/api/sns-wrapper.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import {
  snsAggregatorIncludingAbortedProjectsStore,
  snsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import { snsProposalsStore } from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { isLastCall } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import { ProposalStatus, Topic, type ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { getCurrentIdentity } from "../auth.services";

// Returns a promise that resolves once the snsAggregatorStore data is defined.
export const getLoadedSnsAggregatorData = async (): Promise<CachedSnsDto[]> => {
  let resolve: (aggregatorData: CachedSnsDto[]) => void;
  const promise = new Promise<CachedSnsDto[]>((r) => {
    resolve = r;
  });

  const unsubscribe = snsAggregatorStore.subscribe(({ data }) => {
    if (nonNullish(data)) {
      resolve(data);
      // We can't unsubscribe here because the handler can be called
      // synchronously before the unsubscribe function is returned.
    }
  });

  try {
    return await promise;
  } finally {
    unsubscribe();
  }
};

export const loadSnsProjects = async (): Promise<void> => {
  try {
    const aggregatorData = await snsAggregatorApiService.querySnsProjects();
    const identity = getCurrentIdentity();
    // We load the wrappers to avoid making calls to SNS-W and Root canister for each project.
    // The SNS Aggregator gives us the canister ids of the SNS projects.
    await Promise.all(
      aggregatorData.map(async ({ canister_ids, lifecycle }) => {
        const canisterIds = {
          rootCanisterId: Principal.fromText(canister_ids.root_canister_id),
          swapCanisterId: Principal.fromText(canister_ids.swap_canister_id),
          governanceCanisterId: Principal.fromText(
            canister_ids.governance_canister_id
          ),
          ledgerCanisterId: Principal.fromText(canister_ids.ledger_canister_id),
          indexCanisterId: Principal.fromText(canister_ids.index_canister_id),
        };
        if (lifecycle.lifecycle === SnsSwapLifecycle.Aborted) {
          return;
        }
        // Build certified and uncertified wrappers because SNS aggregator gives certified data.
        await buildAndStoreWrapper({
          identity,
          certified: true,
          canisterIds,
        });
        await buildAndStoreWrapper({
          identity,
          certified: false,
          canisterIds,
        });
      })
    );

    // Calls to SNS canisters are done through an SNS Wrapper that first needs to be initialized with all the SNS canister ids.
    // If the wrapper is not initialized, it triggers a call to list_sns_canisters on the root canister of the SNS project.
    // This call is not necessary because the canister ids are already provided by the SNS aggregator.
    // As soon as the aggregator store is filled, SNS components may start rendering, resulting in calls on the SNS wrappers.
    // We set the aggregator store after building the wrappers' caches to avoid calls to the root canister when the SNS wrapper is initialized.
    snsAggregatorIncludingAbortedProjectsStore.setData(aggregatorData);
    // TODO: PENDING to be implemented, load SNS parameters.
  } catch (err) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error__sns.list_summaries",
      })
    );
  }
};

export const loadProposalsSnsCF = async (): Promise<void> => {
  snsProposalsStore.reset();

  return queryAndUpdate<ProposalInfo[], unknown>({
    identityType: "anonymous",
    strategy: FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      queryProposals({
        beforeProposal: undefined,
        identity,
        includeTopics: [Topic.SnsAndCommunityFund],
        includeStatus: [ProposalStatus.Open],
        certified,
      }),
    onLoad: ({ response: proposals, certified }) =>
      snsProposalsStore.setProposals({
        proposals,
        certified,
      }),
    onError: ({ error: err, certified, strategy }) => {
      console.error(err);

      if (isLastCall({ strategy, certified })) {
        snsProposalsStore.reset();

        toastsError(
          toToastError({
            err,
            fallbackErrorLabelKey: "error.proposal_not_found",
          })
        );
      }
    },
    logMessage: "Syncing Sns proposals",
  });
};
