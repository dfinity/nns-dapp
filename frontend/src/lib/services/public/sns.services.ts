import { snsAggregatorApiService } from "$lib/api-services/sns-aggregator.api-service";
import { queryProposals } from "$lib/api/proposals.api";
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
import { nonNullish } from "@dfinity/utils";

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
