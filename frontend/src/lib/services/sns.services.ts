import { ICP, Topic, type ProposalInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import {
  participateInSnsSwap,
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
  snsQueryStore,
  snsSwapCommitmentsStore,
} from "../stores/sns.store";
import { toastsStore } from "../stores/toasts.store";
import type { Account } from "../types/account";
import type { SnsSwapCommitment } from "../types/sns";
import type { QuerySnsSummary, QuerySnsSwapState } from "../types/sns.query";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { toToastError } from "../utils/error.utils";
import { getAccountIdentity } from "./accounts.services";
import { loadProposalsByTopic } from "./proposals.services";
import {
  queryAndUpdate,
  type QueryAndUpdateOnResponse,
  type QueryAndUpdateStrategy,
} from "./utils.services";

export const loadSnsSummaries = ({
  onError,
}: {
  onError: () => void;
}): Promise<void> => {
  snsQueryStore.setLoadingState();

  return queryAndUpdate<[QuerySnsSummary[], QuerySnsSwapState[]], unknown>({
    request: ({ certified, identity }) =>
      Promise.all([
        querySnsSummaries({ certified, identity }),
        querySnsSwapStates({ certified, identity }),
      ]),
    onLoad: ({ response, certified }) =>
      snsQueryStore.setResponse({ response, certified }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsQueryStore.setLoadingState();

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

/** Combined request: querySnsSummary + querySnsSwapState */
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
}) =>
  queryAndUpdate<
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

      // hide unproven data
      snsSwapCommitmentsStore.setLoadingState();

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
  strategy = "query_and_update",
}: {
  rootCanisterId: string;
  onLoad: QueryAndUpdateOnResponse<SnsSwapCommitment>;
  onError: () => void;
  strategy?: QueryAndUpdateStrategy;
}) =>
  queryAndUpdate<SnsSwapCommitment, unknown>({
    strategy,
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

      // hide unproven data
      snsProposalsStore.setLoadingState();

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

export const participateInSwap = async ({
  amount,
  rootCanisterId,
  account,
  onSuccess,
}: {
  amount: ICP;
  rootCanisterId: Principal;
  account: Account;
  onSuccess?: (swapState: SnsSwapCommitment) => void;
}): Promise<{ success: boolean }> => {
  try {
    const accountIdentity = await getAccountIdentity(account.identifier);
    await participateInSnsSwap({
      identity: accountIdentity,
      rootCanisterId,
      amount,
      controller: accountIdentity.getPrincipal(),
      fromSubAccount: "subAccount" in account ? account.subAccount : undefined,
    });
    await loadSnsSwapCommitment({
      strategy: "update",
      rootCanisterId: rootCanisterId.toText(),
      onLoad: ({ response: swapCommitment, certified }) => {
        snsSwapCommitmentsStore.setSwapCommitment({
          swapCommitment,
          certified,
        });
        onSuccess?.(swapCommitment);
      },
      onError: () => {
        // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-798
      },
    });
    return { success: true };
  } catch (error) {
    // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-798
    return { success: false };
  }
};
