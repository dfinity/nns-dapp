import { Topic, type ProposalInfo } from "@dfinity/nns";
import {
  querySnsSummaries,
  querySnsSummary,
  querySnsSwapCommitment,
  querySnsSwapCommitments,
  querySnsSwapState,
  querySnsSwapStates,
} from "../api/sns.api";
import { AppPath } from "../constants/routes.constants";
import {
  snsProposalsStore,
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "../stores/projects.store";
import { toastsStore } from "../stores/toasts.store";
import type { SnsSwapCommitment } from "../types/sns";
import type { QuerySnsSummary, QuerySnsSwapState } from "../types/sns.query";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { toToastError } from "../utils/error.utils";
import { concatSnsSummaries } from "../utils/sns.utils";
import { loadProposalsByTopic } from "./proposals.services";
import {
  queryAndUpdate,
  type QueryAndUpdateOnResponse,
} from "./utils.services";

export const loadSnsSummaries = ({
  onError,
}: {
  onError: () => void;
}): Promise<void> => {
  snsSummariesStore.setLoadingState();

  return queryAndUpdate<[QuerySnsSummary[], QuerySnsSwapState[]], unknown>({
    request: ({ certified, identity }) =>
      Promise.all([
        querySnsSummaries({ certified, identity }),
        querySnsSwapStates({ certified, identity }),
      ]),
    onLoad: ({ response, certified }) =>
      snsSummariesStore.setSummaries({
        summaries: concatSnsSummaries(response),
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.list_summaries",
        })
      );

      onError();
    },
    logMessage: "Syncing Sns summaries",
  });
};

export const loadSnsSummary = async ({
  rootCanisterId,
  onLoad,
  onError,
}: {
  rootCanisterId: string;
  onLoad: QueryAndUpdateOnResponse<
    [QuerySnsSummary | undefined, QuerySnsSwapState | undefined]
  >;
  onError: () => void;
}) => {
  // TODO(L2-838): load only if not yet in store

  return queryAndUpdate<
    [QuerySnsSummary | undefined, QuerySnsSwapState | undefined],
    unknown
  >({
    request: ({ certified, identity }) =>
      Promise.all([
        querySnsSummary({
          rootCanisterId,
          identity,
          certified,
        }),
        querySnsSwapState({ rootCanisterId, identity, certified }),
      ]),
    onLoad,
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_summary",
        })
      );

      onError();
    },
    logMessage: "Syncing Sns summary",
  });
};

export const loadSnsSwapCommitments = ({
  onError,
}: {
  onError: () => void;
}): Promise<void> => {
  snsSwapCommitmentsStore.setLoadingState();

  return queryAndUpdate<SnsSwapCommitment[], unknown>({
    request: ({ certified, identity }) =>
      querySnsSwapCommitments({ certified, identity }),
    onLoad: ({ response: swapCommitments, certified }) => {
      for (const swapCommitment of swapCommitments) {
        snsSwapCommitmentsStore.setSwapCommitment({
          swapCommitment,
          certified,
        });
      }
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.list_swap_commitments",
        })
      );

      onError();
    },
    logMessage: "Syncing Sns swap commitments",
  });
};

export const loadSnsSwapCommitment = async ({
  rootCanisterId,
  onLoad,
  onError,
}: {
  rootCanisterId: string;
  onLoad: QueryAndUpdateOnResponse<SnsSwapCommitment>;
  onError: () => void;
}) => {
  // TODO(L2-838): load only if not yet in store

  return queryAndUpdate<SnsSwapCommitment, unknown>({
    request: ({ certified, identity }) =>
      querySnsSwapCommitment({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad,
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_swap_commitment",
        })
      );

      onError();
    },
    logMessage: "Syncing Sns swap commitment",
  });
};

export const listSnsProposals = async (): Promise<void> => {
  snsProposalsStore.setLoadingState();

  return queryAndUpdate<ProposalInfo[], unknown>({
    request: ({ certified, identity }) =>
      loadProposalsByTopic({
        certified,
        identity,
        topic: Topic.SnsDecentralizationSale,
      }),
    onLoad: ({ response: proposals, certified }) =>
      snsProposalsStore.setProposals({
        proposals,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // TODO(L2-839): reset and clear stores

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.proposal_not_found",
        })
      );
    },
    logMessage: "Syncing Sns proposals",
  });
};

export const routePathRootCanisterId = (path: string): string | undefined => {
  if (!isRoutePath({ path: AppPath.ProjectDetail, routePath: path })) {
    return undefined;
  }
  return getLastPathDetail(path);
};
